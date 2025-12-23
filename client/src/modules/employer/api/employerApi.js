// src/modules/employer/api/employerApi.js
import { apiFetch } from "@/shared/lib/apiClient";

/**
 * Employer API (frontend)
 *
 * Backend routes:
 *  GET    /api/employers/me
 *  PATCH  /api/employers/onboarding
 *  PUT    /api/employers/me
 *  POST   /api/employers/me/upload
 *
 * Job routes:
 *  POST   /api/employers/jobs
 *  GET    /api/employers/jobs
 *  GET    /api/employers/jobs/:id
 *  PUT    /api/employers/jobs/:id
 */

export const employerApi = {
  // ----- Employer profile -----

  // GET /employers/me
  me: () => apiFetch("/employers/me"),

  // GET /employers/explore (public listing)
  explore: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const stringValue = String(value).trim();
      if (stringValue === "") return;
      searchParams.set(key, stringValue);
    });
    const queryString = searchParams.toString();
    return apiFetch(`/employers/explore${queryString ? `?${queryString}` : ""}`);
  },

  // PATCH /employers/onboarding  (wizard partial save)
  updateOnboarding: (payload) =>
    apiFetch("/employers/onboarding", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // PUT /employers/me  (settings full update)
  updateProfile: (payload) =>
    apiFetch("/employers/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // POST /employers/me/upload  (logo + banner)
  upload: ({ logo, banner } = {}) => {
    const fd = new FormData();
    if (logo) fd.append("logo", logo);
    if (banner) fd.append("banner", banner);

    return apiFetch("/employers/me/upload", {
      method: "POST",
      body: fd,
    });
  },

  // ----- Jobs -----
// applications list for a job
jobApplications: (jobId) =>
  apiFetch(`/employers/jobs/${jobId}/applications`),

// update status (shortlist / reject / etc.)
updateApplication: (jobId, appId, payload) =>
  apiFetch(`/employers/jobs/${jobId}/applications/${appId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),

  // POST /employers/jobs  (create job)
  createJob: (payload) =>
    apiFetch("/employers/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // GET /employers/saved-candidates
  savedCandidates: () => apiFetch("/employers/saved-candidates"),

  saveCandidate: (applicantId) =>
    apiFetch("/employers/saved-candidates", {
      method: "POST",
      body: JSON.stringify({ applicantId }),
    }),

  removeSavedCandidate: (applicantId) =>
    apiFetch(`/employers/saved-candidates/${applicantId}`, {
      method: "DELETE",
    }),

  // GET /employers/jobs  (list current employer jobs)
  myJobs: () => apiFetch("/employers/jobs"),

  // GET /employers/jobs/:id  (single job for edit view)
  getJob: (id) => apiFetch(`/employers/jobs/${id}`),

  dashboardStats: () => apiFetch("/employers/dashboard"),

  // PUT /employers/jobs/:id  (update job)
  updateJob: (id, payload) =>
    apiFetch(`/employers/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
