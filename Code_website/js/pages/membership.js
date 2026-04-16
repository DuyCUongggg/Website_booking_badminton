import { membershipApi } from "../services/membership.service.js";
import { showToast } from "../ui/toast.js";

const list = document.getElementById("membershipList");

function render(items) {
  list.innerHTML = (items || [])
    .map(
      (m) => `
      <article class="card">
        <h3>${m.tenHang}</h3>
        <p>Mã hạng: ${m.maHang}</p>
        <p>Giảm giá: ${m.tyLeGiamGia || 0}%</p>
        <p>Điểm tối thiểu: ${m.diemToiThieu || 0}</p>
      </article>
    `
    )
    .join("");
}

async function init() {
  try {
    const res = await membershipApi.getAll();
    render(res.data || []);
  } catch (error) {
    showToast(error.message || "Không tải được danh sách hạng.", "error");
  }
}

init();
