import { apiClient } from "@/shared/lib/apiClient";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.keyword) searchParams.set("q", params.keyword);
  if (params.location) searchParams.set("location", params.location);
  if (params.gender && params.gender !== "all") {
    searchParams.set("gender", params.gender);
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
};

export const candidatesApi = {
  list(params) {
    return apiClient.get(`/applicants${buildQueryString(params)}`);
  },
};
