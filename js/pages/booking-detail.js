import { currency } from "../core/format.js";
import { getToken } from "../core/storage.js";
import { getDemoBookingById, removeDemoBooking, updateDemoBooking } from "../core/demo-bookings.js";
import { bookingApi } from "../services/booking.service.js";
import { showToast } from "../ui/toast.js";

const courtTitle = document.getElementById("courtTitle");
const dateLabel = document.getElementById("dateLabel");
const slotLabel = document.getElementById("slotLabel");
const serviceList = document.getElementById("serviceList");
const summaryBlock = document.getElementById("summaryBlock");
const totalAmount = document.getElementById("totalAmount");
const payBtn = document.getElementById("payBtn");
const cancelBtn = document.getElementById("cancelBtn");
let currentBooking = null;

const servicesCatalog = [
  { maDichVu: "DV_SHUTTLE", tenDichVu: "Quả cầu lông (1 ống)", donGia: 250000, image: "assets/services/shuttlecock.png" },
  { maDichVu: "DV_RACKET", tenDichVu: "Thuê vợt Pro", donGia: 50000, image: "assets/services/racket.png" },
  { maDichVu: "DV_WATER", tenDichVu: "Nước suối", donGia: 10000, image: "assets/services/water.png" },
  { maDichVu: "DV_TAPE", tenDichVu: "Grip Tape", donGia: 40000, image: "assets/services/grip-tape.png" },
  { maDichVu: "DV_GEL", tenDichVu: "Energy Gel", donGia: 30000, image: "assets/services/energy-gel.png" },
  { maDichVu: "DV_TOWEL", tenDichVu: "Towel", donGia: 20000, image: "assets/services/towel.png" }
];

if (!getToken()) {
  window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const maDatSan = params.get("maDatSan");

function calcServiceTotal(dichVuPhu = []) {
  return (dichVuPhu || []).reduce((sum, dv) => sum + Number(dv.thanhTien || (dv.soLuong || 0) * (dv.donGia || 0)), 0);
}

function normalizedServices(raw = []) {
  return (raw || []).map((dv) => ({
    maDichVu: dv.maDichVu,
    soLuong: Number(dv.soLuong || 0),
    donGia: Number(dv.donGia || 0),
    thanhTien: Number(dv.thanhTien || Number(dv.soLuong || 0) * Number(dv.donGia || 0))
  }));
}

function renderServices() {
  if (!currentBooking) return;
  const selectedMap = new Map((currentBooking.dichVuPhu || []).map((dv) => [dv.maDichVu, dv]));
  serviceList.innerHTML = servicesCatalog
    .map((service) => {
      const selected = selectedMap.get(service.maDichVu);
      const soLuong = selected?.soLuong || 0;
      const total = soLuong * service.donGia;
      return `
        <div class="bg-surface-container-low p-4 rounded-xl flex flex-col sm:flex-row items-center gap-6">
          <div class="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
            <img src="${service.image}" alt="${service.tenDichVu}" class="w-full h-full object-cover" onerror="this.style.display='none'">
          </div>
          <div class="flex-grow text-center sm:text-left">
            <h4 class="font-bold text-lg">${service.tenDichVu}</h4>
            <p class="text-primary font-headline font-bold">${currency(service.donGia)}</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center bg-white border border-gray-200 rounded-full p-1">
              <button data-action="minus" data-service="${service.maDichVu}" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">-</button>
              <span class="w-10 text-center font-bold font-headline">${soLuong}</span>
              <button data-action="plus" data-service="${service.maDichVu}" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">+</button>
            </div>
            <div class="w-24 text-right">
              <p class="text-xs text-gray-500">TỔNG</p>
              <p class="font-headline font-bold text-primary">${currency(total)}</p>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function recalcAndRenderSummary() {
  if (!currentBooking) return;
  const tongTienDichVu = calcServiceTotal(currentBooking.dichVuPhu);
  const tongTienSan = Number(currentBooking.tongTienSan || 0);
  const tongThanhToan = tongTienSan + tongTienDichVu;

  currentBooking.tongTienDichVu = tongTienDichVu;
  currentBooking.tongThanhToan = tongThanhToan;
  currentBooking.soTienConLai = Math.max(tongThanhToan - Number(currentBooking.soTienDaCoc || 0), 0);

  const maSans = Array.isArray(currentBooking.maSans) && currentBooking.maSans.length
    ? currentBooking.maSans
    : String(currentBooking.maSan || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

  courtTitle.textContent = maSans.length > 1 ? `${maSans.length} sân đã chọn` : `${currentBooking.tenSan || currentBooking.maSan || "-"}`;
  dateLabel.textContent = currentBooking.ngayChoi || "-";
  slotLabel.textContent = (currentBooking.cacChoi || []).join(", ") || "-";
  summaryBlock.innerHTML = `
    <div class="flex justify-between"><span class="text-gray-500">Mã đơn</span><span class="font-semibold">${currentBooking.maDatSan || "-"}</span></div>
    <div class="flex justify-between"><span class="text-gray-500">Số sân</span><span class="font-semibold">${maSans.length || 1}</span></div>
    <div class="flex justify-between"><span class="text-gray-500">Số ca</span><span class="font-semibold">${(currentBooking.cacChoi || []).length || 1}</span></div>
    <div class="flex justify-between"><span class="text-gray-500">Tiền sân</span><span class="font-semibold">${currency(tongTienSan)}</span></div>
    <div class="flex justify-between"><span class="text-gray-500">Dịch vụ phụ</span><span class="font-semibold">${currency(tongTienDichVu)}</span></div>
  `;
  totalAmount.textContent = currency(tongThanhToan);
}

function persistDemoBookingIfExists() {
  const demo = getDemoBookingById(maDatSan);
  if (!demo) return;
  updateDemoBooking(maDatSan, {
    dichVuPhu: currentBooking.dichVuPhu,
    tongTienDichVu: currentBooking.tongTienDichVu,
    tongThanhToan: currentBooking.tongThanhToan,
    soTienConLai: currentBooking.soTienConLai
  });
}

function render(d) {
  currentBooking = {
    ...d,
    ngayChoi: d.ngayChoi || d.ngay,
    cacChoi: d.cacChoi || [],
    dichVuPhu: normalizedServices(d.dichVuPhu || [])
  };
  renderServices();
  recalcAndRenderSummary();
}

async function load() {
  if (!maDatSan) return;
  try {
    const res = await bookingApi.getDetail(maDatSan);
    render(res.data || {});
  } catch (error) {
    const demo = getDemoBookingById(maDatSan);
    if (!demo) {
      showToast(error.message || "Không tải được chi tiết đơn.", "error");
      return;
    }
    render(demo);
  }
}

payBtn?.addEventListener("click", () => {
  if (!maDatSan) {
    showToast("Không tìm thấy mã đơn để thanh toán.", "error");
    return;
  }
  persistDemoBookingIfExists();
  window.location.href = `payment.html?maDatSan=${encodeURIComponent(maDatSan)}`;
});

cancelBtn?.addEventListener("click", async () => {
  try {
    await bookingApi.cancel(maDatSan);
    showToast("Đã hủy đơn.", "success");
    window.location.href = "my-bookings.html";
  } catch (error) {
    const demo = getDemoBookingById(maDatSan);
    if (demo) {
      removeDemoBooking(maDatSan);
      showToast("Đã hủy đơn.", "success");
      window.location.href = "my-bookings.html";
      return;
    }
    showToast(error.message || "Không hủy được đơn.", "error");
  }
});

serviceList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;
  const maDichVu = target.dataset.service;
  if (!action || !maDichVu || !currentBooking) return;

  const service = servicesCatalog.find((s) => s.maDichVu === maDichVu);
  if (!service) return;

  const current = currentBooking.dichVuPhu.find((x) => x.maDichVu === maDichVu);
  if (action === "plus") {
    if (current) {
      current.soLuong += 1;
      current.thanhTien = current.soLuong * current.donGia;
    } else {
      currentBooking.dichVuPhu.push({
        maDichVu,
        soLuong: 1,
        donGia: service.donGia,
        thanhTien: service.donGia
      });
    }
  }

  if (action === "minus" && current) {
    current.soLuong -= 1;
    current.thanhTien = Math.max(current.soLuong, 0) * current.donGia;
    if (current.soLuong <= 0) {
      currentBooking.dichVuPhu = currentBooking.dichVuPhu.filter((x) => x.maDichVu !== maDichVu);
    }
  }

  renderServices();
  recalcAndRenderSummary();
});

load();
