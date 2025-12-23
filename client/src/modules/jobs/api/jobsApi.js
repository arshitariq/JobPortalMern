import { apiClient } from "@/shared/lib/apiClient";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.append(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const jobsApi = {
  list(params = {}) {
    const query = buildQueryString(params);
    return apiClient.get(`/jobs${query}`);
  },
  get(jobId) {
    return apiClient.get(`/jobs/${jobId}`);
  },
};
