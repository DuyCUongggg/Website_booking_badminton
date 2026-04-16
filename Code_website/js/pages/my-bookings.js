import { currency } from "../core/format.js";
import { getToken } from "../core/storage.js";
import { getAllDemoBookings } from "../core/demo-bookings.js";
import { bookingApi } from "../services/booking.service.js";

const list = document.getElementById("bookingList");
const bookingCount = document.getElementById("bookingCount");
const tabUpcoming = document.getElementById("tabUpcoming");
const tabHistory = document.getElementById("tabHistory");

let allBookings = [];
let activeTab = "upcoming";

if (!getToken()) {
  window.location.href = "login.html";
}

function normalizeStatus(status = "") {
  return String(status).trim().toLowerCase();
}

function isHistoryBooking(item) {
  const status = normalizeStatus(item.trangThai);
  return status.includes("hủy") || status.includes("hoàn thành") || status.includes("da huy") || status.includes("hoan thanh");
}

function getBadge(status = "") {
  const s = normalizeStatus(status);
  if (s.includes("hủy") || s.includes("da huy")) {
    return `<span class="px-3 py-1 text-[11px] font-bold rounded-full bg-red-50 text-red-700 border border-red-100">Đã hủy</span>`;
  }
  if (s.includes("hoàn thành") || s.includes("hoan thanh")) {
    return `<span class="px-3 py-1 text-[11px] font-bold rounded-full bg-stone-100 text-stone-700 border border-stone-200">Hoàn thành</span>`;
  }
  if (s.includes("xác nhận") || s.includes("xac nhan")) {
    return `<span class="px-3 py-1 text-[11px] font-bold rounded-full bg-green-50 text-green-700 border border-green-100">Đã xác nhận</span>`;
  }
  return `<span class="px-3 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100">Đang chờ</span>`;
}

function getCourtsText(item) {
  if (Array.isArray(item.maSans) && item.maSans.length) return item.maSans.join(", ");
  return item.tenSan || item.maSan || "-";
}

function getSlotsText(item) {
  if (Array.isArray(item.cacChoi) && item.cacChoi.length) return item.cacChoi.join(", ");
  return "-";
}

function render(items) {
  if (!items.length) {
    list.innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-sm opacity-70">
          Chưa có đơn trong mục ${activeTab === "upcoming" ? "Sắp tới" : "Lịch sử"}.
        </td>
      </tr>
    `;
    if (bookingCount) bookingCount.textContent = "0 đơn";
    return;
  }

  if (bookingCount) {
    bookingCount.textContent = `${items.length} đơn ${activeTab === "upcoming" ? "sắp tới" : "lịch sử"}`;
  }

  list.innerHTML = items
    .map(
      (b) => `
      <tr class="hover:bg-surface-container-low/50 transition-colors">
        <td class="px-4 py-4 font-headline font-bold text-primary">${b.maDatSan || "-"}</td>
        <td class="px-4 py-4 font-semibold">${getCourtsText(b)}</td>
        <td class="px-4 py-4">${b.ngayChoi || "-"}</td>
        <td class="px-4 py-4 text-sm">${getSlotsText(b)}</td>
        <td class="px-4 py-4 font-bold">${currency(b.tongThanhToan)}</td>
        <td class="px-4 py-4 text-center">${getBadge(b.trangThai)}</td>
        <td class="px-4 py-4 text-right">
          <a href="booking-detail.html?maDatSan=${encodeURIComponent(b.maDatSan)}" class="inline-flex px-3 py-2 rounded-lg bg-white border border-outline-variant/30 text-sm font-semibold hover:bg-surface-container-low">
            Chi tiết
          </a>
        </td>
      </tr>
    `
    )
    .join("");
}

function applyTabStyles() {
  const upcomingActive = activeTab === "upcoming";
  tabUpcoming?.classList.toggle("bg-primary", upcomingActive);
  tabUpcoming?.classList.toggle("text-white", upcomingActive);
  tabUpcoming?.classList.toggle("font-bold", upcomingActive);
  tabUpcoming?.classList.toggle("text-on-surface", !upcomingActive);

  tabHistory?.classList.toggle("bg-primary", !upcomingActive);
  tabHistory?.classList.toggle("text-white", !upcomingActive);
  tabHistory?.classList.toggle("font-bold", !upcomingActive);
  tabHistory?.classList.toggle("text-on-surface", upcomingActive);
}

function renderByTab() {
  const items = allBookings.filter((item) => {
    const isHistory = isHistoryBooking(item);
    return activeTab === "upcoming" ? !isHistory : isHistory;
  });
  render(items);
  applyTabStyles();
}

async function init() {
  try {
    const res = await bookingApi.getMine();
    allBookings = res.data || [];
  } catch {
    allBookings = getAllDemoBookings();
  }
  renderByTab();
}

tabUpcoming?.addEventListener("click", () => {
  activeTab = "upcoming";
  renderByTab();
});

tabHistory?.addEventListener("click", () => {
  activeTab = "history";
  renderByTab();
});

init();
