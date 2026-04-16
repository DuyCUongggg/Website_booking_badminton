import { DEMO_MODE } from "../core/config.js";
import { apiCall } from "../core/http.js";
import { clearToken, clearUser, getUser, setToken, setUser } from "../core/storage.js";

function ok(data) {
  return Promise.resolve({ success: true, data, message: null });
}

export const authApi = {
  register(payload) {
    if (DEMO_MODE) {
      const user = {
        maKhachHang: "KH_DEMO",
        hoTen: payload.hoTen,
        email: payload.email,
        soDienThoai: payload.soDienThoai,
        tenHang: "Bạc",
        diemTichLuy: 0,
        token: "demo-token"
      };
      return ok(user);
    }
    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  login(payload) {
    if (DEMO_MODE) {
      return ok({
        maKhachHang: "KH_DEMO",
        hoTen: "Khách web",
        email: payload.email,
        soDienThoai: "0900000000",
        tenHang: "Bạc",
        diemTichLuy: 0,
        token: "demo-token"
      });
    }
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  me() {
    if (DEMO_MODE) {
      const u = getUser();
      return ok(u || { hoTen: "Khách", email: "demo@local", maKhachHang: "KH_DEMO" });
    }
    return apiCall("/auth/me");
  }
};

export async function loginWithEmail(email, matKhau) {
  const res = await authApi.login({ email, matKhau });
  if (res.success && res.data?.token) {
    setToken(res.data.token);
    setUser(res.data);
  }
  return res;
}

export async function registerAccount(hoTen, soDienThoai, email, matKhau) {
  const res = await authApi.register({ hoTen, soDienThoai, email, matKhau });
  if (res.success && res.data?.token) {
    setToken(res.data.token);
    setUser(res.data);
  }
  return res;
}

export function logout() {
  clearToken();
  clearUser();
  window.location.href = "login.html";
}
