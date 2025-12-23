// src/modules/employer/pages/EmployerMyJobsPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { employerApi } from "@/modules/employer/api/employerApi";

const PAGE_SIZE = 10;

function getStatusPillClasses(status) {
  const s = (status || "").toLowerCase();
  if (s === "expired" || s === "expire") return "bg-red-50 text-red-700";
  if (s === "draft") return "bg-slate-100 text-slate-700";
  return "bg-emerald-50 text-emerald-700"; // default active
}

function getStatusLabel(status) {
  if (!status) return "Active";
  const s = status.toLowerCase();
  if (s === "expire") return "Expired";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getDaysRemaining(expirationDate) {
  if (!expirationDate) return null;
  const end = new Date(expirationDate).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function EmployerMyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [menuJobId, setMenuJobId] = useState(null); // <-- kis row ka menu open hai

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await employerApi.myJobs();
        if (res.status === "SUCCESS") {
          setJobs(res.data || []);
        } else {
          setError(res.message || "Failed to load jobs");
        }
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading jobs");
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  // filter
  const filteredJobs = useMemo(() => {
    if (statusFilter === "all") return jobs;
    return jobs.filter((job) => {
      const s = (job.status || "active").toLowerCase();
      if (statusFilter === "active") return s !== "expired" && s !== "expire";
      if (statusFilter === "expired") return s === "expired" || s === "expire";
      return true;
    });
  }, [jobs, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, page]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted rounded-md" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Jobs</h1>
          <p className="text-sm text-muted-foreground">
            All jobs you have posted on Jobpilot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Job status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <Link
            to="/employer/post-job"
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Post a Job
          </Link>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          You haven&apos;t posted any jobs yet.
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-card overflow-visible">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Jobs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applications</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job) => {
                  const statusLabel = getStatusLabel(job.status);
                  const statusClasses = getStatusPillClasses(job.status);
                  const applicationsCount =
                    job.applicationCount ??
                    job.applicationsCount ??
                    job.applications?.length ??
                    0;

                  const daysRemaining = getDaysRemaining(job.expirationDate);
                  let remainingText = "";
                  if (typeof daysRemaining === "number") {
                    remainingText =
                      daysRemaining >= 0
                        ? `${daysRemaining} days remaining`
                        : `${Math.abs(daysRemaining)} days ago`;
                  }

                  const metaParts = [];
                  if (job.jobType) metaParts.push(job.jobType);
                  if (job.city || job.country)
                    metaParts.push(job.city || job.country);
                  if (remainingText) metaParts.push(remainingText);

                  return (
                    <tr
                      key={job._id}
                      className="border-t text-sm hover:bg-muted/40"
                    >
                      {/* title + meta */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{job.title}</span>
                          {metaParts.length > 0 && (
                            <span className="mt-0.5 text-xs text-muted-foreground">
                              {metaParts.join(" • ")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* status */}
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 ${statusClasses}`}
                        >
                          <span
                            className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${statusLabel === "Expired"
                              ? "bg-red-500"
                              : "bg-emerald-500"
                              }`}
                          />
                          {statusLabel}
                        </span>
                      </td>

                      {/* applications count */}
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {applicationsCount}
                        </span>{" "}
                        Applications
                      </td>

                      {/* actions */}


                      <td className="relative px-4 py-3 text-right text-xs">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/employer/jobs/${job._id}/applications`}
                            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                          >
                            View Applications
                          </Link>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setMenuJobId((prev) => (prev === job._id ? null : job._id))
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-muted"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>

                            {menuJobId === job._id && (
                              <div className="absolute right-0 top-full mt-2 w-40 rounded-md border bg-popover py-1 text-xs shadow-md z-50">
                                <button
                                  type="button"
                                  className="block w-full px-3 py-1.5 text-left hover:bg-muted"
                                >
                                  Promote Job
                                </button>
                                <Link
                                  to={`/employer/jobs/${job._id}/edit`}
                                  className="block w-full px-3 py-1.5 text-left hover:bg-muted"
                                >
                                  View Detail / Edit
                                </Link>
                                <button
                                  type="button"
                                  className="block w-full px-3 py-1.5 text-left hover:bg-muted"
                                >
                                  Make it Expire
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing{" "}
                <span className="font-medium">
                  {(page - 1) * PAGE_SIZE + 1}
                </span>{" "}
                –{" "}
                <span className="font-medium">
                  {Math.min(page * PAGE_SIZE, filteredJobs.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredJobs.length}</span> jobs
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border px-2 py-1 disabled:opacity-40 hover:bg-muted"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-md text-center text-xs ${p === page
                        ? "bg-primary text-primary-foreground"
                        : "border hover:bg-muted"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-md border px-2 py-1 disabled:opacity-40 hover:bg-muted"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
