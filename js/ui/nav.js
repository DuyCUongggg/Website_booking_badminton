import { getToken, getUser } from "../core/storage.js";
import { logout } from "../services/auth.service.js";

const link = "text-sm font-semibold text-on-surface hover:text-primary transition-colors";

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

function renderMainNav() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  const user = getUser();
  const token = getToken();

  if (user && token) {
    nav.innerHTML = `
      <a href="booking.html" class="${link}">Đặt sân</a>
      <a href="my-bookings.html" class="${link}">Đơn của tôi</a>
      <a href="membership.html" class="${link}">Hạng thành viên</a>
      <a href="profile.html" class="${link}">Hồ sơ</a>
      <button type="button" id="logoutBtn" class="text-sm font-semibold text-primary hover:underline">Đăng xuất</button>
    `;
    document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    nav.innerHTML = `
      <a href="booking.html" class="${link}">Đặt sân</a>
      <a href="membership.html" class="${link}">Hạng thành viên</a>
    `;
  }
}

function renderHeaderAuth() {
  const host = document.getElementById("headerAuth");
  if (!host) return;

  const user = getUser();
  const token = getToken();

  if (user && token) {
    const name = user.hoTen || user.email || "Khách";
    host.innerHTML = `
      <a href="profile.html" class="flex items-center gap-2 max-w-[min(14rem,40vw)] rounded-xl px-2 py-1 hover:bg-black/[0.04] transition-colors" title="Hồ sơ">
        <span class="material-symbols-outlined text-primary text-[30px] leading-none shrink-0">account_circle</span>
        <span class="font-headline font-bold text-sm truncate">${escapeHtml(name)}</span>
      </a>
    `;
  } else {
    host.innerHTML = `
      <a href="register.html" class="hidden sm:inline font-label font-bold text-xs uppercase tracking-wider text-on-surface/90 hover:text-primary transition-colors">Đăng ký</a>
      <a href="login.html" class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-label text-xs uppercase tracking-wider hover:opacity-95 transition-opacity">Đăng nhập</a>
    `;
  }
}

renderMainNav();
renderHeaderAuth();
