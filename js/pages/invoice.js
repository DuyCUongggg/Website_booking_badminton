import { currency } from "../core/format.js";
import { getToken } from "../core/storage.js";
import { getDemoBookingById } from "../core/demo-bookings.js";
import { bookingApi } from "../services/booking.service.js";
import { showToast } from "../ui/toast.js";

if (!getToken()) {
  window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const maDatSan = params.get("maDatSan");
const invoiceBody = document.getElementById("invoiceBody");
const detailLink = document.getElementById("detailLink");

if (detailLink && maDatSan) {
  detailLink.href = `booking-detail.html?maDatSan=${encodeURIComponent(maDatSan)}`;
}

function render(d) {
  invoiceBody.innerHTML = `
    <p><span class="font-semibold">Mã đơn:</span> ${d.maDatSan || "-"}</p>
    <p><span class="font-semibold">Ngày tạo:</span> ${d.ngayTao || "-"}</p>
    <p><span class="font-semibold">Sân:</span> ${d.tenSan || d.maSan || "-"}</p>
    <p><span class="font-semibold">Ngày chơi:</span> ${d.ngayChoi || "-"}</p>
    <p><span class="font-semibold">Trạng thái đơn:</span> ${d.trangThai || "-"}</p>
    <p><span class="font-semibold">Trạng thái thanh toán:</span> ${d.trangThaiThanhToan || "-"}</p>
    <p><span class="font-semibold">Tổng tiền sân:</span> ${currency(d.tongTienSan)}</p>
    <p><span class="font-semibold">Tổng thanh toán:</span> ${currency(d.tongThanhToan)}</p>
    <p><span class="font-semibold">Đã thanh toán:</span> ${currency(d.soTienDaCoc || d.tongThanhToan)}</p>
    <p><span class="font-semibold">Còn lại:</span> ${currency(d.soTienConLai || 0)}</p>
  `;
}

async function loadInvoice() {
  if (!maDatSan) {
    invoiceBody.innerHTML = "<p>Không tìm thấy mã đơn.</p>";
    return;
  }

  try {
    const res = await bookingApi.getDetail(maDatSan);
    render(res.data || {});
  } catch (error) {
    const demo = getDemoBookingById(maDatSan);
    if (!demo) {
      invoiceBody.innerHTML = "<p>Không tải được dữ liệu hóa đơn.</p>";
      showToast(error.message || "Không tải được dữ liệu hóa đơn.", "error");
      return;
    }
    render(demo);
  }
}

loadInvoice();
