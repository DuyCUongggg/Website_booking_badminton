import { DEMO_MODE } from "../core/config.js";
import { loginWithEmail } from "../services/auth.service.js";
import { showToast } from "../ui/toast.js";

const form = document.getElementById("loginForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await loginWithEmail(email, password);
    showToast("Đăng nhập thành công", "success");
    window.location.href = "index.html";
  } catch (error) {
    const message = error?.message || "";
    if (!DEMO_MODE && message.includes("Failed to fetch")) {
      showToast("Không kết nối được server.", "error");
      return;
    }
    showToast(message || "Đăng nhập thất bại", "error");
  }
});
