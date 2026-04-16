const BG = {
  error: "#dc2626",
  success: "#16a34a",
  info: "#475569"
};

/** @param {"error"|"success"|"info"} [type] */
export function showToast(message, type = "success") {
  const el = document.createElement("div");
  el.textContent = message;
  el.style.position = "fixed";
  el.style.right = "16px";
  el.style.bottom = "16px";
  el.style.padding = "10px 14px";
  el.style.borderRadius = "8px";
  el.style.color = "#fff";
  el.style.zIndex = "9999";
  el.style.background = BG[type] || BG.success;
  el.style.maxWidth = "min(92vw, 360px)";
  el.style.boxShadow = "0 4px 12px rgba(0,0,0,.15)";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}
