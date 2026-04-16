import { DEMO_MODE } from "../core/config.js";
import { getToken } from "../core/storage.js";
import { createDemoBooking } from "../core/demo-bookings.js";
import { bookingApi } from "../services/booking.service.js";
import { courtApi } from "../services/court.service.js";
import { showToast } from "../ui/toast.js";

const form = document.getElementById("bookingForm");
const maSanInput = document.getElementById("maSan");
const sanList = document.getElementById("sanList");
const bookingPanelSubtitle = document.getElementById("bookingPanelSubtitle");
const bookingPanelNote = document.getElementById("bookingPanelNote");
const bookingGrid = document.getElementById("bookingGrid");
const cacChoiInput = document.getElementById("cacChoi");
const ngayInput = document.getElementById("ngay");
const ngayChoiHint = document.getElementById("ngayChoiHint");
const setTodayBtn = document.getElementById("setTodayBtn");

if (!getToken()) {
  window.location.href = "login.html";
}
const SAN_ORDER = ["S001", "S002", "S003", "S004", "S005", "S006", "S007"];
const SLOT_ORDER = ["CC001", "CC002", "CC003", "CC004", "CC005", "CC006", "CC007", "CC008", "CC009", "CC010"];
const selectedCells = new Set(); // Format: S001|CC001

function slotSort(a, b) {
  return SLOT_ORDER.indexOf(a) - SLOT_ORDER.indexOf(b);
}

function applyBookingPanelMode() {
  if (bookingPanelSubtitle) bookingPanelSubtitle.textContent = "Đã đăng nhập, đặt sân nhanh hơn";
  if (bookingPanelNote) bookingPanelNote.textContent = "Có thể chọn nhiều sân và nhiều ca trực tiếp trên lưới.";
}

function setToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  if (ngayInput) ngayInput.value = `${y}-${m}-${d}`;
  if (ngayChoiHint) ngayChoiHint.value = ngayInput?.value || "";
}

function normalizeSans(value) {
  return value
    .split(",")
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean)
    .filter((san) => SAN_ORDER.includes(san));
}

function syncInputsFromSelection() {
  const selectedSans = Array.from(selectedCells)
    .map((k) => k.split("|")[0])
    .filter(Boolean);
  const uniqueSans = Array.from(new Set(selectedSans)).sort(
    (a, b) => SAN_ORDER.indexOf(a) - SAN_ORDER.indexOf(b)
  );

  if (uniqueSans.length) {
    maSanInput.value = uniqueSans.join(",");
  }

  const selectedSlots = Array.from(selectedCells)
    .map((k) => k.split("|")[1])
    .filter(Boolean);
  const uniqueSlots = Array.from(new Set(selectedSlots)).sort(slotSort);
  cacChoiInput.value = uniqueSlots.join(",");
}

function clearGridSelectionUI() {
  bookingGrid?.querySelectorAll(".slot-btn").forEach((btn) => {
    btn.classList.remove("ring-2", "ring-primary", "bg-green-100");
  });
}

function repaintGridSelectionUI() {
  clearGridSelectionUI();
  bookingGrid?.querySelectorAll(".slot-btn").forEach((btn) => {
    const key = `${btn.dataset.san || ""}|${btn.dataset.slot || ""}`;
    if (selectedCells.has(key)) {
      btn.classList.add("ring-2", "ring-primary", "bg-green-100");
    }
  });
}

function attachGridMetadata() {
  if (!bookingGrid) return;
  const rows = bookingGrid.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, cellIdx) => {
      const btn = cell.querySelector(".slot-btn");
      if (!btn || !btn.dataset.slot) return;
      const san = SAN_ORDER[cellIdx - 1];
      if (!san) return;
      btn.dataset.san = san;
      btn.title = `${san} - ${btn.dataset.slot}`;
    });
  });
}

function bindGridSelection() {
  bookingGrid?.addEventListener("click", (event) => {
    const target = event.target;
    const btn = target instanceof HTMLElement ? target.closest(".slot-btn") : null;
    if (!btn) return;

    const slot = btn.dataset.slot || "";
    const san = btn.dataset.san || "";
    if (!slot || !san) return;

    const key = `${san}|${slot}`;
    if (selectedCells.has(key)) {
      selectedCells.delete(key);
    } else {
      selectedCells.add(key);
    }
    syncInputsFromSelection();
    repaintGridSelectionUI();
  });
}

async function loadSans() {
  const res = await courtApi.getSans();
  const sans = res.data || [];
  if (sanList) {
    sanList.innerHTML = sans
      .map((s) => `<option value="${s.maSan}">${s.tenSan}</option>`)
      .join("");
  }
  if (!maSanInput.value && sans.length) {
    maSanInput.value = sans[0].maSan;
  }
}

maSanInput?.addEventListener("change", () => {
  const validSans = normalizeSans(maSanInput.value);
  if (validSans.length) {
    maSanInput.value = Array.from(new Set(validSans)).join(",");
  }
});

setTodayBtn?.addEventListener("click", setToday);
ngayInput?.addEventListener("change", () => {
  if (ngayChoiHint) ngayChoiHint.value = ngayInput.value || "";
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const loaiThanhToan = document.getElementById("loaiThanhToan").value;

  const typedSans = normalizeSans(maSanInput.value);
  const selectedDetails = Array.from(selectedCells).map((key) => {
    const [maSan, maCaChoi] = key.split("|");
    return { maSan, maCaChoi };
  });
  const derivedSans = Array.from(new Set(selectedDetails.map((x) => x.maSan)));
  const maSans = derivedSans.length ? derivedSans : typedSans;
  const cacChoi = Array.from(new Set(selectedDetails.map((x) => x.maCaChoi))).sort(slotSort);

  if (!maSans.length) {
    showToast("Vui lòng chọn ít nhất 1 sân.", "error");
    return;
  }
  if (!ngayInput.value) {
    showToast("Vui lòng chọn ngày chơi.", "error");
    return;
  }
  if (!selectedDetails.length) {
    showToast("Vui lòng chọn ít nhất 1 ô ca chơi trên lưới.", "error");
    return;
  }
  if (selectedDetails.length > 16) {
    showToast("Mỗi đơn tối đa 16 ô sân–ca.", "error");
    return;
  }

  const payload = {
    maSan: maSans[0],
    maSans,
    ngay: ngayInput.value,
    cacChoi,
    lichDatChiTiet: selectedDetails,
    ghiChu: document.getElementById("ghiChu").value.trim(),
    dichVuPhu: [],
    loaiThanhToan
  };

  try {
    const res = await bookingApi.create(payload, { handleUnauthorized: true });
    const maDatSan = res.data?.maDatSan;
    showToast("Đặt sân thành công", "success");
    if (maDatSan) {
      window.location.href = `booking-detail.html?maDatSan=${encodeURIComponent(maDatSan)}`;
    } else {
      window.location.href = "my-bookings.html";
    }
  } catch (err) {
    if (DEMO_MODE) {
      showToast(err?.message || "Không thể tạo đơn", "error");
      return;
    }
    const demoBooking = createDemoBooking(payload, { source: "fallback" });
    showToast("Đặt sân thành công", "success");
    window.location.href = `booking-detail.html?maDatSan=${encodeURIComponent(demoBooking.maDatSan)}`;
  }
});

loadSans().catch((e) => showToast(e.message || "Không tải được danh sách sân", "error"));
applyBookingPanelMode();
attachGridMetadata();
bindGridSelection();
setToday();
