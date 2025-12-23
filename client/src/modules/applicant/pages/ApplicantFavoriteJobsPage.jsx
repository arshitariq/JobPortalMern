// src/modules/applicant/pages/ApplicantFavoriteJobsPage.jsx
import React, { useEffect, useState } from "react";
import { applicantApi } from "../api/applicantApi";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { MapPin, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ApplicantFavoriteJobsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await applicantApi.getFavorites();
        if (res.status === "SUCCESS") {
          setItems(res.data || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggle = async (jobId) => {
    try {
      setTogglingId(jobId);
      const res = await applicantApi.toggleFavorite(jobId);
      if (res.status === "SUCCESS") {
        toast.success(res.message || "Updated");
        if (res.data?.liked === false) {
          setItems((prev) => prev.filter((f) => f.job?.id !== jobId));
        }
      } else {
        toast.error(res.message || "Failed");
      }
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
        You don&apos;t have any favorite jobs yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Favorite Jobs ({items.length})</h2>

      {items.map((fav) => (
        <Card key={fav.id}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              {fav.job?.logoUrl && (
                <img
                  src={fav.job.logoUrl}
                  alt={fav.job.title}
                  className="h-10 w-10 rounded-md object-cover"
                />
              )}
              <div>
                <div className="text-sm font-medium">
                  {fav.job?.title || "Job removed"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {fav.job?.companyName}
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {fav.job?.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {fav.job.location}
                    </span>
                  )}
                  {fav.job?.jobType && (
                    <span className="rounded-full bg-muted px-2 py-0.5">
                      {fav.job.jobType}
                    </span>
                  )}
                  {fav.job?.salaryRange && <span>{fav.job.salaryRange}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-xs">
              <span className="text-muted-foreground">
                Added: {new Date(fav.addedAt).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                {fav.job && (
                  <Button size="sm" asChild>
                    <Link to={`/jobs/${fav.job.id}`}>View Details</Link>
                  </Button>
                )}

                {fav.job && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={togglingId === fav.job.id}
                    onClick={() => handleToggle(fav.job.id)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
