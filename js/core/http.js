import { API_BASE_URL } from "./config.js";
import { clearToken, clearUser, getToken } from "./storage.js";

export async function apiCall(endpoint, options = {}) {
  const { handleUnauthorized = true, ...requestOptions } = options;
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: { ...headers, ...requestOptions.headers }
  });

  if (res.status === 401 && handleUnauthorized) {
    clearToken();
    clearUser();
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.href = "login.html";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `API error ${res.status}`);
  }
  return data;
}
