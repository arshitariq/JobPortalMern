// src/modules/employer/pages/EmployerJobApplicationsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { employerApi } from "@/modules/employer/api/employerApi";

const STATUSES = ["all", "shortlisted", "rejected"];

const statusBadgeClassMap = {
  applied: "bg-blue-100 text-blue-800",
  under_review: "bg-slate-100 text-slate-700",
  shortlisted: "bg-amber-100 text-amber-800",
  interview: "bg-violet-100 text-violet-800",
  assessment: "bg-teal-100 text-teal-800",
  offer: "bg-emerald-100 text-emerald-800",
  hired: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

const statusLabels = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer Sent",
  hired: "Accepted",
  rejected: "Rejected",
};

const getStatusBadgeClass = (status) =>
  statusBadgeClassMap[status] || "bg-gray-100 text-gray-700";

const getStatusLabel = (status) =>
  statusLabels[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Applied");

export default function EmployerJobApplicationsPage() {
  const { jobId } = useParams();
  const [jobTitle, setJobTitle] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await employerApi.jobApplications(jobId);
        if (res.status === "SUCCESS") {
          setJobTitle(res.data?.jobTitle || res.data?.job?.title || "");
          setApplications(res.data?.applications || []);
        } else {
          setError(res.message || "Failed to load applications");
        }
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading applications");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId]);

  const sortedFiltered = useMemo(() => {
    let list = [...applications];

    if (statusFilter !== "all") {
      list = list.filter(
        (a) => (a.status || "all").toLowerCase() === statusFilter
      );
    }

    list.sort((a, b) => {
      const da = new Date(a.appliedAt || a.createdAt || 0).getTime();
      const db = new Date(b.appliedAt || b.createdAt || 0).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return list;
  }, [applications, sort, statusFilter]);

  const moveToStatus = async (appId, newStatus) => {
    try {
      // optimistic UI
      setApplications((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, status: newStatus } : a
        )
      );

      await employerApi.updateApplication(jobId, appId, {
        status: newStatus,
      });
    } catch (e) {
      console.error(e);
      // TODO: optionally rollback
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted rounded-md" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  const allList = sortedFiltered; // we'll still show "All Applications" column

  const shortlisted = allList.filter(
    (a) => (a.status || "").toLowerCase() === "shortlisted"
  );

  return (
    <div className="space-y-5">
      {/* breadcrumb-ish header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Job / {jobTitle || "Job"} / Applications
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            Job Applications
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* filter by status (top-right small) */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Filter</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="all">All</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* sort drop-down */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* columns (simple 2 columns like screenshot) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* All Applications column */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-semibold">
              All Applications{" "}
              <span className="text-xs text-muted-foreground">
                ({allList.length})
              </span>
            </div>
          </div>

          <div className="space-y-3 p-4">
            {allList.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No applications yet.
              </p>
            ) : (
                allList.map((app) => (
                  <ApplicationCard
                    key={app._id}
                    app={app}
                    onAccept={() => moveToStatus(app._id, "hired")}
                    onShortlist={() => moveToStatus(app._id, "shortlisted")}
                    onReject={() => moveToStatus(app._id, "rejected")}
                  />
                ))
            )}
          </div>
        </div>

        {/* Shortlisted column */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-semibold">
              Shortlisted{" "}
              <span className="text-xs text-muted-foreground">
                ({shortlisted.length})
              </span>
            </div>
          </div>

          <div className="space-y-3 p-4">
            {shortlisted.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No shortlisted candidates yet.
              </p>
            ) : (
                shortlisted.map((app) => (
                  <ApplicationCard
                    key={app._id}
                    app={app}
                    onAccept={() => moveToStatus(app._id, "hired")}
                    onReject={() => moveToStatus(app._id, "rejected")}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ app, onShortlist, onReject, onAccept }) {
  const appliedDate = app.appliedAt || app.createdAt;
  const status = (app.status || "applied").toLowerCase();
  const statusLabel = getStatusLabel(status);

  return (
    <div className="rounded-lg border bg-background p-3 text-xs shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-muted">
          {app.avatarUrl ? (
            <img
              src={app.avatarUrl}
              alt={app.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
              {app.name?.[0] ?? "A"}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold">{app.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {app.currentRole || app.appliedRole || "Candidate"}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
        {app.experienceYears != null && (
          <div>• {app.experienceYears} Years Experience</div>
        )}
        {app.education && <div>• Education: {app.education}</div>}
        {appliedDate && (
          <div>
            • Applied: {new Date(appliedDate).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(status)}`}>
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {onAccept && status !== "hired" && status !== "rejected" && (
            <button
              type="button"
              onClick={onAccept}
              className="rounded-md border border-emerald-500 px-2 py-1 text-[11px] text-emerald-600 hover:bg-emerald-50"
            >
              Accept
            </button>
          )}
          {onShortlist && status !== "shortlisted" && status !== "hired" && (
            <button
              type="button"
              onClick={onShortlist}
              className="rounded-md border px-2 py-1 text-[11px] hover:bg-muted"
            >
              Shortlist
            </button>
          )}
          {onReject && status !== "rejected" && (
            <button
              type="button"
              onClick={onReject}
              className="rounded-md border border-red-500 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
            >
              Reject
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <a
          href={app.cvUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-medium text-blue-600 hover:underline"
        >
          Download CV
        </a>

        <div className="flex gap-2">
          {onShortlist && (
            <button
              type="button"
              onClick={onShortlist}
              className="rounded-md border px-2 py-1 text-[11px] hover:bg-muted"
            >
              Shortlist
            </button>
          )}
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              className="rounded-md border border-red-500 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
