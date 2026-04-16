import { registerAccount } from "../services/auth.service.js";
import { showToast } from "../ui/toast.js";

const form = document.getElementById("registerForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const hoTen = document.getElementById("hoTen").value.trim();
  const soDienThoai = document.getElementById("soDienThoai").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await registerAccount(hoTen, soDienThoai, email, password);
    showToast("Đăng ký thành công.", "success");
    window.location.href = "index.html";
  } catch (error) {
    showToast(error.message || "Đăng ký thất bại.", "error");
  }
});
