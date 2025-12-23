// src/modules/applicant/pages/ApplicantAppliedJobsPage.jsx
import React, { useEffect, useState } from "react";
import { applicantApi } from "../api/applicantApi";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_LABELS = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer Sent",
  hired: "Accepted",
  rejected: "Rejected",
};

const STATUS_BADGE_CLASSES = {
  applied: "bg-blue-50 text-blue-700",
  under_review: "bg-slate-50 text-slate-700",
  shortlisted: "bg-amber-50 text-amber-700",
  interview: "bg-violet-50 text-violet-700",
  assessment: "bg-teal-50 text-teal-700",
  offer: "bg-emerald-50 text-emerald-700",
  hired: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export default function ApplicantAppliedJobsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await applicantApi.getApplications();
        if (res.status === "SUCCESS") {
          setItems(res.data?.applications || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading applications…</p>;
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
        You haven&apos;t applied to any jobs yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Applied Jobs ({items.length})</h2>
        <span className="text-sm text-muted-foreground">
          Latest applications live here.
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((application) => {
          const job = application.job || {};
          const badgeClass =
            STATUS_BADGE_CLASSES[application.status || "applied"] ||
            "bg-gray-100 text-gray-700";
          const badgeLabel =
            STATUS_LABELS[application.status] || "Applied";

          return (
            <Card
              key={application.id}
              className="border border-border bg-white shadow-sm transition hover:shadow-lg"
            >
              <CardContent className="flex flex-col gap-5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xs font-semibold text-slate-500 shadow-inner">
                      {job.logoUrl ? (
                        <img
                          src={job.logoUrl}
                          alt={job.companyName}
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        (job.companyName || "Job")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-foreground">
                        {job.title || "Role removed"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {job.companyName || "Company name"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badgeClass}`}
                  >
                    {badgeLabel}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    Applied on{" "}
                    <span className="font-medium text-foreground">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {job.location && (
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {job.jobType}
                      </span>
                    )}
                    {job.salaryRange && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {job.salaryRange}
                      </span>
                    )}
                  </div>
                </div>

                <Button size="sm" asChild className="self-start">
                  <Link to={`/jobs/${job.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
