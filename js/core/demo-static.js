/** Dữ liệu tĩnh cho DEMO_MODE — không cần API / SQL */
export const DEMO_COURTS = [
  { maSan: "S001", tenSan: "Sân Galaxy A", moTa: "Demo", giaMacDinh: 150000 },
  { maSan: "S002", tenSan: "Sân Galaxy B", moTa: "Demo", giaMacDinh: 150000 },
  { maSan: "S003", tenSan: "Sân Galaxy C", moTa: "Demo", giaMacDinh: 160000 },
  { maSan: "S004", tenSan: "Sân Galaxy D", moTa: "Demo", giaMacDinh: 160000 },
  { maSan: "S005", tenSan: "Sân Pro 1", moTa: "Demo", giaMacDinh: 180000 },
  { maSan: "S006", tenSan: "Sân Pro 2", moTa: "Demo", giaMacDinh: 180000 },
  { maSan: "S007", tenSan: "Sân VIP", moTa: "Demo", giaMacDinh: 220000 }
];

export function demoScheduleSevenDays() {
  const out = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    out.push({
      ngay: `${y}-${m}-${day}`,
      san: [{}, {}, {}]
    });
  }
  return out;
}

export const DEMO_MEMBERSHIPS = [
  { maHang: "HTV001", tenHang: "Đồng", tyLeGiamGia: 0, diemToiThieu: 0 },
  { maHang: "HTV002", tenHang: "Bạc", tyLeGiamGia: 5, diemToiThieu: 100 },
  { maHang: "HTV003", tenHang: "Vàng", tyLeGiamGia: 10, diemToiThieu: 300 },
  { maHang: "HTV004", tenHang: "Kim cương", tyLeGiamGia: 15, diemToiThieu: 800 }
];
