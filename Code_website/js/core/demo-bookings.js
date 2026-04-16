const DEMO_BOOKINGS_KEY = "demoBookings";

function readBookings() {
  return JSON.parse(localStorage.getItem(DEMO_BOOKINGS_KEY) || "[]");
}

function writeBookings(bookings) {
  localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(bookings));
}

function nextBookingCode(existing) {
  const numbers = existing
    .map((b) => Number(String(b.maDatSan || "").replace("DS", "")))
    .filter((n) => Number.isFinite(n));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `DS${String(next).padStart(6, "0")}`;
}

export function createDemoBooking(payload, meta = {}) {
  const bookings = readBookings();
  const maDatSan = nextBookingCode(bookings);
  const lichDatChiTiet = Array.isArray(payload.lichDatChiTiet) ? payload.lichDatChiTiet : [];
  const maSans = Array.isArray(payload.maSans)
    ? payload.maSans
    : String(payload.maSan || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
  const tongTienSan = (lichDatChiTiet.length || ((maSans.length || 1) * ((payload.cacChoi || []).length || 1))) * 150000;
  const tongTienDichVu = 0;
  const tongThanhToan = tongTienSan + tongTienDichVu;
  const soTienDaCoc = payload.loaiThanhToan === "coc" ? Math.round(tongThanhToan * 0.5) : tongThanhToan;
  const soTienConLai = Math.max(tongThanhToan - soTienDaCoc, 0);

  const booking = {
    maDatSan,
    ngayTao: new Date().toISOString(),
    ngayChoi: payload.ngay,
    maSan: payload.maSan,
    maSans,
    tenSan: payload.maSan,
    cacChoi: payload.cacChoi || [],
    lichDatChiTiet,
    ghiChu: payload.ghiChu || "",
    trangThai: "Chờ xác nhận",
    trangThaiThanhToan: soTienConLai > 0 ? "Đã cọc" : "Đã thanh toán đầy đủ",
    tongTienSan,
    tongTienDichVu,
    tongThanhToan,
    soTienDaCoc,
    soTienConLai,
    loaiThanhToan: payload.loaiThanhToan,
    thongTinKhach: payload.thongTinKhach || null,
    source: meta.source || "demo"
  };

  bookings.push(booking);
  writeBookings(bookings);
  return booking;
}

export function getAllDemoBookings() {
  return readBookings().sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao));
}

export function getDemoBookingById(maDatSan) {
  return readBookings().find((b) => b.maDatSan === maDatSan) || null;
}

export function updateDemoBooking(maDatSan, updates) {
  const bookings = readBookings();
  const idx = bookings.findIndex((b) => b.maDatSan === maDatSan);
  if (idx < 0) return null;
  bookings[idx] = { ...bookings[idx], ...updates };
  writeBookings(bookings);
  return bookings[idx];
}

export function removeDemoBooking(maDatSan) {
  const bookings = readBookings();
  const next = bookings.filter((b) => b.maDatSan !== maDatSan);
  writeBookings(next);
}
