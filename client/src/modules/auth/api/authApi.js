import { apiFetch } from "@/shared/lib/apiClient";

export const authApi = {
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiFetch("/auth/me"),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),

  forgotPassword: (email) =>
    apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (payload) =>
    apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) }),

  resendVerification: (email) =>
    apiFetch("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),

  verifyEmail: (token) => apiFetch(`/auth/verify-email?token=${token}`),
};
