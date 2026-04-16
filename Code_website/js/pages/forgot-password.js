import { showToast } from "../ui/toast.js";

const form = document.getElementById("forgotPasswordForm");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Tính năng đang được cập nhật.", "info");
});
