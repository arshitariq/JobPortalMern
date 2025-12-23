import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { Button } from "@/shared/ui/button";
import { applicantApi } from "@/modules/applicant/api/applicantApi";

export default function ApplicantDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);


  const displayName = user?.fullName || user?.name || "Candidate";
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviews: 0,
    savedJobs: 0,
  });
  const [dashboardError, setDashboardError] = useState("");

  const INTERVIEW_STATUS_KEYS = useMemo(
    () => ["interview", "shortlisted", "assessment", "offer"],
    []
  );

  const STATUS_BADGE_CLASSES = useMemo(
    () => ({
      applied: "bg-blue-50 text-blue-700",
      under_review: "bg-slate-50 text-slate-700",
      shortlisted: "bg-amber-50 text-amber-700",
      interview: "bg-violet-50 text-violet-700",
      assessment: "bg-teal-50 text-teal-700",
      offer: "bg-emerald-50 text-emerald-700",
      hired: "bg-emerald-50 text-emerald-700",
      rejected: "bg-red-50 text-red-700",
      withdrawn: "bg-red-50 text-red-700",
      on_hold: "bg-muted text-muted-foreground",
      archived: "bg-muted text-muted-foreground",
    }),
    []
  );

  const loadDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const statusRequests = INTERVIEW_STATUS_KEYS.map((status) =>
        applicantApi.getApplications({ status, page: 1, limit: 1 })
      );

      const [
        { status: appsStatus, data: appsData },
        { data: favData },
        ...statusResponses
      ] = await Promise.all([
        applicantApi.getApplications({ page: 1, limit: 6 }),
        applicantApi.getFavorites({ page: 1, limit: 1 }),
        ...statusRequests,
      ]);

      if (appsStatus !== "SUCCESS") {
        throw new Error("Failed to fetch applications");
      }

      const fetchedApplications = appsData?.applications || [];
      const totalApplications = appsData?.pagination?.total || fetchedApplications.length;
      const interviewCount = statusResponses.reduce(
        (sum, response) => sum + (response?.data?.pagination?.total || 0),
        0
      );
      const savedJobs = favData?.pagination?.total ?? 0;

      setApplications(fetchedApplications.slice(0, 3));
      setStats({
        totalApplications,
        interviews: interviewCount,
        savedJobs,
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setDashboardError("We couldn’t load your dashboard. Please refresh.");
    } finally {
      setDashboardLoading(false);
    }
  }, [INTERVIEW_STATUS_KEYS]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="min-h-screen bg-background">
     
      {/* MAIN */}
      <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6">
        {/* TITLE */}
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Hi {displayName}, track your applications and discover new opportunities.
          </p>
        </div>

        {dashboardError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {dashboardError}
          </div>
        )}

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              label: "Applications",
              value: stats.totalApplications,
              helper: "Total jobs you applied to",
            },
            {
              label: "Interviews",
              value: stats.interviews,
              helper: "Interviews & next steps",
            },
            {
              label: "Saved Jobs",
              value: stats.savedJobs,
              helper: "Jobs you bookmarked",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border bg-card p-5"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold">
                {dashboardLoading ? "…" : card.value ?? 0}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{card.helper}</p>
            </div>
          ))}
        </div>

        {/* RECENT APPLICATIONS */}
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Applications</h2>

            <Button
              variant="link"
              className="text-sm font-medium"
              onClick={() => navigate("/applicant/applications")}
            >
              View all
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {dashboardLoading ? (
              <div className="rounded-xl border bg-background p-5 text-sm text-muted-foreground">
                Loading your applications…
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-xl border bg-background p-5 text-sm text-muted-foreground">
                You haven’t applied to any jobs yet.
              </div>
            ) : (
              applications.map((application) => {
                const job = application.job || {};
                const status = (application.status || "applied").toLowerCase();
                const badgeClass =
                  STATUS_BADGE_CLASSES[status] || "bg-gray-100 text-gray-700";
                const postedLabel = job.postedAt
                  ? new Date(job.postedAt).toLocaleDateString()
                  : application.createdAt
                  ? new Date(application.createdAt).toLocaleDateString()
                  : "Unknown";
 
                return (
                  <div
                    key={application._id || application.id}
                    className="flex flex-col gap-2 rounded-xl border bg-background p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {job.title || "Job removed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.company || "Company"} • {job.location || "Location"}
                        {job.jobType ? ` • ${job.jobType}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Applied: {postedLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                      >
                        {status.replace(/_/g, " ").toUpperCase()}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (job._id) {
                            navigate(`/jobs/${job._id}`);
                          }
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">Complete your profile</p>
              <p className="text-sm text-muted-foreground">
                A complete profile helps employers trust you more.
              </p>
            </div>

            <button
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              onClick={() => navigate("/applicant/profile")}
            >
              Update Profile
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
