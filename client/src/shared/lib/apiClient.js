// src/shared/api/client.js
import { env } from "@/shared/config/env";

/**
 * Thin wrapper around fetch that automatically prefixes API_URL,
 * attaches credentials and normalizes the JSON response.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${env.API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      status: "ERROR",
      message: data?.message || "Request failed",
      data: null,
    };
  }

  return data;
}

const normalizeBody = (body) => {
  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    typeof body === "string" ||
    body instanceof URLSearchParams
  ) {
    return body;
  }

  if (body == null) return undefined;
  return JSON.stringify(body);
};

const request = (method, path, body, options) => {
  const mergedOptions = {
    ...(options || {}),
    method,
  };

  if (body !== undefined) {
    mergedOptions.body = normalizeBody(body);
  }

  return apiFetch(path, mergedOptions);
};

export const apiClient = {
  get: (path, options) => request("GET", path, undefined, options),
  delete: (path, options) => request("DELETE", path, undefined, options),
  post: (path, body, options) => request("POST", path, body, options),
  put: (path, body, options) => request("PUT", path, body, options),
  patch: (path, body, options) => request("PATCH", path, body, options),
};
