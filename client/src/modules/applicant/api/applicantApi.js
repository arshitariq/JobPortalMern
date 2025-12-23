import { apiClient } from "@/shared/lib/apiClient"; // jo bhi tum use kar rahe ho

export const applicantApi = {
  async me() {
    return apiClient.get("/applicants/me");
  },

  async updateProfile(payload) {
    return apiClient.put("/applicants/me", payload);
  },

  async uploadResume(file) {
    const formData = new FormData();
    formData.append("resume", file);
    return apiClient.post("/applicants/me/resume", formData);
  },

  async getApplications(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const stringValue = String(value).trim();
      if (stringValue === "") return;
      searchParams.set(key, stringValue);
    });
    const queryString = searchParams.toString();
    return apiClient.get(
      `/applicants/applications${queryString ? `?${queryString}` : ""}`
    );
  },

  async getFavorites(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const stringValue = String(value).trim();
      if (stringValue === "") return;
      searchParams.set(key, stringValue);
    });
    const queryString = searchParams.toString();
    return apiClient.get(
      `/applicants/favorites${queryString ? `?${queryString}` : ""}`
    );
  },

  async toggleFavorite(jobId) {
    return apiClient.post(`/applicants/favorites/${jobId}/toggle`);
  },

  async getJobEngagement(jobId) {
    return apiClient.get(`/applicants/jobs/${jobId}/engagement`);
  },

  async applyToJob(jobId, payload) {
    return apiClient.post(`/applicants/jobs/${jobId}/apply`, payload);
  },

  async upload(payload) {
    const formData = new FormData();
    if (payload.avatar) formData.append("avatar", payload.avatar);
    if (payload.banner) formData.append("banner", payload.banner);
    if (payload.resume) formData.append("resume", payload.resume);

    return apiClient.post("/applicants/me/upload", formData);
  },

  async getProfile() {
    return apiClient.get("/applicants/me");
  },
};
