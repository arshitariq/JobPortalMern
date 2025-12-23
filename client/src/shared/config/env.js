// src/shared/config/env.js
export const env = {
  // Backend base URL (Express)
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
};
