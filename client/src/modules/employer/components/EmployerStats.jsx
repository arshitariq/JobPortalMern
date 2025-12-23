import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Briefcase, Users, Clock } from "lucide-react";
import { employerApi } from "@/modules/employer/api/employerApi";

const formatTimeAgo = (value) => {
  if (!value) return "Unknown";
  const posted = Date.parse(value);
  if (Number.isNaN(posted)) return "Unknown";
  const diff = Date.now() - posted;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
};

const initialStats = { jobCount: 0, savedCandidates: 0, recentJobs: [] };

export default function EmployerStats() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await employerApi.dashboardStats();
        if (!mounted) return;
        if (res?.status === "SUCCESS") {
          setStats(res.data);
          setError("");
        } else {
          setError(res?.message || "Unable to load dashboard stats");
        }
      } catch {
        if (!mounted) return;
        setError("Unable to load dashboard stats");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadStats();
    return () => { mounted = false; };
  }, []);

  const recentJobs = stats.recentJobs || [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] border-transparent text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{loading ? "…" : stats.jobCount}</p>
              <p className="text-sm">Open Jobs</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] border-transparent text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{loading ? "…" : stats.savedCandidates}</p>
              <p className="text-sm">Saved candidates</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] text-white shadow-lg">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white/80">Recent jobs</p>
              <p className="text-base font-semibold">Keep track of your latest postings</p>
            </div>
            <div className="p-2 rounded-lg bg-white/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>

          {error && <p className="text-sm text-red-200">{error}</p>}

          {loading ? (
            <p className="text-sm text-white/80">Loading recent jobs…</p>
          ) : recentJobs.length === 0 ? (
            <p className="text-sm text-white/80">No jobs posted yet. Start by creating a new job.</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-xl border border-white/20 p-4">
                  <div>
                    <p className="text-sm font-semibold">{job.title}</p>
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <span className="rounded-full border px-2 py-0.5 border-white/50">
                        {job.status || "Unknown"}
                      </span>
                      <span>{formatTimeAgo(job.postedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-white/70">
                    <p className="font-semibold">{job.applications ?? 0}</p>
                    <p>applicants</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
