import React, { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import { employerApi } from "@/modules/employer/api/employerApi";

const STATUS_BADGE_CLASSES = {
  applied: "bg-blue-50 text-blue-700",
  under_review: "bg-slate-50 text-slate-700",
  shortlisted: "bg-amber-50 text-amber-700",
  interview: "bg-violet-50 text-violet-700",
  assessment: "bg-teal-50 text-teal-700",
  offer: "bg-emerald-50 text-emerald-700",
  hired: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  saved: "bg-slate-50 text-slate-700",
};

const getBadgeClass = (status) =>
  STATUS_BADGE_CLASSES[status?.toLowerCase?.() || "saved"] ||
  "bg-gray-100 text-gray-700";

const formatSavedDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "Not available";

export default function EmployerSavedCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuId, setMenuId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await employerApi.savedCandidates();
        if (res.status === "SUCCESS") {
          setCandidates(res.data || []);
        } else {
          setError(res.message || "Failed to load saved candidates");
        }
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading saved candidates");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Saved Candidates
          </h1>
          <p className="text-sm text-muted-foreground">
            All of the candidates you have bookmarked.
          </p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          You haven&apos;t saved any candidates yet.
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate, idx) => {
            const menuKey = candidate._id || candidate.applicantId;
            return (
              <div
                key={menuKey}
                className={`rounded-2xl border bg-white p-5 text-sm ${
                  idx !== candidates.length - 1 ? "shadow-sm" : "shadow-none"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                      {candidate.avatarUrl ? (
                        <img
                          src={candidate.avatarUrl}
                          alt={candidate.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                          {candidate.name?.[0] || "C"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {candidate.name || "Candidate"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {candidate.currentRole || "Role not specified"}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getBadgeClass(
                      candidate.status
                    )}`}
                  >
                    {(candidate.status || "saved")
                      .toString()
                      .replace(/_/g, " ")
                      .toUpperCase()}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
                  <p>
                    Saved on{" "}
                    <span className="font-medium text-foreground">
                      {formatSavedDate(candidate.appliedAt)}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {candidate.applyEmail && (
                      <a
                        href={`mailto:${candidate.applyEmail}`}
                        className="rounded-full border px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-muted"
                      >
                        Email
                      </a>
                    )}
                    {candidate.cvUrl && (
                      <a
                        href={candidate.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-muted"
                      >
                        Resume
                      </a>
                    )}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuId((prev) => (prev === menuKey ? null : menuKey))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-muted"
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>

                      {menuId === menuKey && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-md border bg-popover py-1 text-xs shadow-md">
                          {candidate.applyEmail && (
                            <a
                              href={`mailto:${candidate.applyEmail}`}
                              className="block px-3 py-1.5 hover:bg-muted"
                            >
                              Send Email
                            </a>
                          )}
                          {candidate.cvUrl && (
                            <a
                              href={candidate.cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block px-3 py-1.5 hover:bg-muted"
                            >
                              Download CV
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
