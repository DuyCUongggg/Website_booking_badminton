import { getToken, getUser } from "../core/storage.js";
import { authApi } from "../services/auth.service.js";
import { showToast } from "../ui/toast.js";

const hoTenInput = document.getElementById("hoTenInput");
const soDienThoaiInput = document.getElementById("soDienThoaiInput");
const emailInput = document.getElementById("emailInput");
const hangThanhVienInput = document.getElementById("hangThanhVienInput");
const profileNameLabel = document.getElementById("profileNameLabel");
const profileTierLabel = document.getElementById("profileTierLabel");
const maKhachHangLabel = document.getElementById("maKhachHangLabel");
const diemTichLuyLabel = document.getElementById("diemTichLuyLabel");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");

if (!getToken()) {
  window.location.href = "login.html";
}

function render(user) {
  hoTenInput.value = user.hoTen || "";
  soDienThoaiInput.value = user.soDienThoai || "";
  emailInput.value = user.email || "";
  hangThanhVienInput.value = user.tenHang || user.maHang || "-";
  profileNameLabel.textContent = user.hoTen || "-";
  profileTierLabel.textContent = user.tenHang ? `Thành viên ${user.tenHang}` : "Thành viên";
  maKhachHangLabel.textContent = user.maKhachHang || "-";
  diemTichLuyLabel.textContent = `${user.diemTichLuy ?? 0}`;
}

async function init() {
  const localUser = getUser();
  if (localUser) render(localUser);
  try {
    const res = await authApi.me();
    render(res.data || localUser || {});
  } catch (error) {
    showToast(error.message || "Không tải được hồ sơ.", "error");
  }
}

saveProfileBtn?.addEventListener("click", () => {
  showToast("Tính năng đang được cập nhật.", "info");
});

changePasswordBtn?.addEventListener("click", () => {
  showToast("Tính năng đang được cập nhật.", "info");
});

init();
