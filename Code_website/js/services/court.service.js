import { DEMO_MODE } from "../core/config.js";
import { DEMO_COURTS, demoScheduleSevenDays } from "../core/demo-static.js";
import { apiCall } from "../core/http.js";

function ok(data) {
  return Promise.resolve({ success: true, data, message: null });
}

export const courtApi = {
  getSans() {
    if (DEMO_MODE) return ok(DEMO_COURTS);
    return apiCall("/courts");
  },
  getLich7Ngay(date) {
    if (DEMO_MODE) return ok(demoScheduleSevenDays());
    const targetDate = date || new Date().toISOString().slice(0, 10);
    return apiCall(`/courts/schedule?date=${encodeURIComponent(targetDate)}`);
  },
  getLichSan(maSan, ngay) {
    if (DEMO_MODE) {
      return ok(
        [
          { maSan, tenSan: "Sân demo", maCaChoi: "CC001", gioBatDau: "06:00", gioKetThuc: "07:30", trangThai: "Trống" },
          { maSan, tenSan: "Sân demo", maCaChoi: "CC002", gioBatDau: "07:30", gioKetThuc: "09:00", trangThai: "Trống" }
        ].filter((x) => x.maSan === maSan)
      );
    }
    return apiCall(`/courts/schedule?date=${encodeURIComponent(ngay)}`).then((res) => ({
      ...res,
      data: (res.data || []).filter((x) => x.maSan === maSan)
    }));
  }
};
