import { currency } from "../core/format.js";
import { getToken } from "../core/storage.js";
import { getDemoBookingById, updateDemoBooking } from "../core/demo-bookings.js";
import { bookingApi } from "../services/booking.service.js";
import { showToast } from "../ui/toast.js";

if (!getToken()) {
  window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const maDatSan = params.get("maDatSan");

const methodButtons = document.querySelectorAll(".method-btn");
const transferPanel = document.getElementById("transferPanel");
const paymentSummary = document.getElementById("paymentSummary");
const transferNote = document.getElementById("transferNote");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
const qrImage = document.getElementById("qrImage");

let selectedMethod = "transfer";

if (qrImage) {
  qrImage.addEventListener("error", () => {
    qrImage.classList.add("hidden");
  });
}

function updateMethodUI() {
  methodButtons.forEach((btn) => {
    const isActive = btn.dataset.method === selectedMethod;
    btn.classList.toggle("border-primary", isActive);
    btn.classList.toggle("bg-green-50", isActive);
  });
  transferPanel.classList.toggle("hidden", selectedMethod !== "transfer");
}

function renderSummary(d = {}) {
  paymentSummary.innerHTML = `
    <p><span class="font-semibold">Mã đơn:</span> ${d.maDatSan || maDatSan}</p>
    <p><span class="font-semibold">Sân:</span> ${d.tenSan || d.maSan || "-"}</p>
    <p><span class="font-semibold">Ngày chơi:</span> ${d.ngayChoi || "-"}</p>
    <p><span class="font-semibold">Trạng thái:</span> ${d.trangThai || "-"}</p>
    <p><span class="font-semibold">Tổng tiền:</span> ${currency(d.tongThanhToan)}</p>
    <p><span class="font-semibold">Đã cọc:</span> ${currency(d.soTienDaCoc)}</p>
    <p><span class="font-semibold">Còn lại:</span> ${currency(d.soTienConLai ?? d.tongThanhToan)}</p>
  `;
}

methodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const method = btn.dataset.method;
    selectedMethod = method;
    updateMethodUI();

    if (method !== "transfer") {
      showToast("Chưa hỗ trợ phương thức này.", "info");
    }
  });
});

confirmPaymentBtn?.addEventListener("click", async () => {
  if (!maDatSan) {
    showToast("Không tìm thấy mã đơn để thanh toán.", "error");
    return;
  }

  if (selectedMethod !== "transfer") {
    showToast("Hiện tại chỉ hỗ trợ thanh toán chuyển khoản.", "error");
    return;
  }

  try {
    await bookingApi.payRemaining(maDatSan, "PT002");
    showToast("Đã xác nhận thanh toán.", "success");
    window.location.href = `invoice.html?maDatSan=${encodeURIComponent(maDatSan)}`;
  } catch (error) {
    const demo = getDemoBookingById(maDatSan);
    if (demo) {
      updateDemoBooking(maDatSan, {
        trangThaiThanhToan: "Đã thanh toán đầy đủ",
        soTienConLai: 0,
        soTienDaCoc: demo.tongThanhToan
      });
      showToast("Đã xác nhận thanh toán.", "success");
      window.location.href = `invoice.html?maDatSan=${encodeURIComponent(maDatSan)}`;
      return;
    }
    showToast(error.message || "Thanh toán thất bại.", "error");
  }
});

async function loadSummary() {
  if (!maDatSan) {
    paymentSummary.innerHTML = "<p>Không tìm thấy mã đơn.</p>";
    return;
  }

  transferNote.textContent = `THANHTOAN_${maDatSan}`;

  try {
    const res = await bookingApi.getDetail(maDatSan);
    renderSummary(res.data || {});
  } catch (error) {
    const d = getDemoBookingById(maDatSan);
    if (!d) {
      paymentSummary.innerHTML = "<p>Không tải được chi tiết đơn.</p>";
      showToast(error.message || "Không tải được chi tiết đơn.", "error");
      return;
    }
    renderSummary(d);
  }
}

updateMethodUI();
loadSummary();
