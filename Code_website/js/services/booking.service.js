import { DEMO_MODE } from "../core/config.js";
import {
  createDemoBooking,
  getAllDemoBookings,
  getDemoBookingById,
  removeDemoBooking,
  updateDemoBooking
} from "../core/demo-bookings.js";
import { apiCall } from "../core/http.js";

function ok(data) {
  return Promise.resolve({ success: true, data, message: null });
}

export const bookingApi = {
  create(payload, options = {}) {
    if (DEMO_MODE) {
      const booking = createDemoBooking(payload, { source: "demo-mode" });
      return ok({ maDatSan: booking.maDatSan });
    }
    return apiCall("/bookings", {
      handleUnauthorized: options.handleUnauthorized ?? true,
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getMine() {
    if (DEMO_MODE) {
      const list = getAllDemoBookings().map((b) => ({
        maDatSan: b.maDatSan,
        tenSan: b.tenSan || (Array.isArray(b.maSans) ? b.maSans.join(", ") : b.maSan),
        ngayChoi: b.ngayChoi,
        trangThai: b.trangThai,
        trangThaiThanhToan: b.trangThaiThanhToan,
        tongThanhToan: b.tongThanhToan
      }));
      return ok(list);
    }
    return apiCall("/bookings/mine");
  },
  getDetail(maDatSan) {
    if (DEMO_MODE) {
      const b = getDemoBookingById(maDatSan);
      if (!b) return Promise.reject(new Error("Không tìm thấy đơn"));
      return ok({
        maDatSan: b.maDatSan,
        maSan: b.maSan,
        maSans: b.maSans || [],
        tenSan: b.tenSan,
        ngayChoi: b.ngayChoi,
        cacChoi: b.cacChoi || [],
        trangThai: b.trangThai,
        trangThaiThanhToan: b.trangThaiThanhToan,
        tongTienSan: b.tongTienSan,
        tongTienDichVu: b.tongTienDichVu || 0,
        tongThanhToan: b.tongThanhToan,
        soTienDaCoc: b.soTienDaCoc,
        soTienConLai: b.soTienConLai,
        dichVuPhu: b.dichVuPhu || [],
        ngayTao: b.ngayTao
      });
    }
    return apiCall(`/bookings/${encodeURIComponent(maDatSan)}`);
  },
  cancel(maDatSan) {
    if (DEMO_MODE) {
      removeDemoBooking(maDatSan);
      return ok(null);
    }
    return apiCall(`/bookings/${encodeURIComponent(maDatSan)}/cancel`, {
      method: "PATCH"
    });
  },
  payRemaining(maDatSan, maPhuongThuc = "PT001") {
    if (DEMO_MODE) {
      const demo = getDemoBookingById(maDatSan);
      if (!demo) return Promise.reject(new Error("Không tìm thấy đơn"));
      updateDemoBooking(maDatSan, {
        trangThaiThanhToan: "Đã thanh toán đầy đủ",
        soTienConLai: 0,
        soTienDaCoc: demo.tongThanhToan
      });
      return ok({});
    }
    return apiCall(`/payments/${encodeURIComponent(maDatSan)}/confirm-transfer`, {
      method: "POST",
      body: JSON.stringify({ maPhuongThuc })
    });
  }
};
