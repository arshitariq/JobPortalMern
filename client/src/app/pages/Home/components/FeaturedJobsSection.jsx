// src/app/pages/Home/components/FeaturedJobsSection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, DollarSign, Building, Clock } from "lucide-react";
import { jobsApi } from "@/modules/jobs/api/jobsApi";

/* ===== Helpers (unchanged) ===== */
const formatSalary = (job) => {
  const min = Number(job.minSalary);
  const max = Number(job.maxSalary);
  if (!Number.isNaN(min) && !Number.isNaN(max) && min > 0 && max > 0) {
    const currency = job.salaryCurrency || "USD";
    const unit =
      job.salaryType === "year"
        ? " / year"
        : job.salaryType === "month"
        ? " / month"
        : "";
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}${unit}`;
  }
  return "Salary not disclosed";
};

const formatLocation = (job) => {
  if (job.isRemote) return "Remote";
  if (job.city && job.country) return `${job.city}, ${job.country}`;
  return job.location || "Location not specified";
};

const getTimeAgo = (dateString) => {
  if (!dateString) return "Recently posted";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

const FeaturedJobsSection = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const res = await jobsApi.list({ limit: 4 });
        if (res?.status === "SUCCESS") {
          const fetched = res.data?.jobs || [];
          setJobs(fetched.slice(0, 4));
          setError("");
        } else {
          setError(res?.message || "Failed to load jobs");
        }
      } catch {
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  return (
    <div className="bg-[#c1fbd9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-[#0f3d2e]">
              Featured Jobs
            </h2>
            <p className="text-[#1f5f46] mt-2">
              Recently posted opportunities
            </p>
          </div>
          <Link
            to="/jobs"
            className="font-semibold text-[#0f3d2e] hover:text-[#145a43]"
          >
            View All Jobs &rarr;
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Jobs */}
        <div className="grid md:grid-cols-2 gap-6">
          {loading ? (
            [...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-[#b6e6c8] bg-white p-6"
              >
                <div className="h-6 w-1/2 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-1/3 rounded bg-gray-200" />
                <div className="mt-6 space-y-3">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>
                <div className="mt-6 h-10 w-full rounded bg-gray-200" />
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl border border-[#b6e6c8] bg-white p-8 text-center text-[#1f5f46]">
              No featured jobs available right now. Check back soon!
            </div>
          ) : (
            jobs.map((job) => {
              const companyName =
                job.employer?.companyName ||
                job.company?.companyName ||
                "Company";

              const companyLogo =
                job.employer?.logo ||
                job.company?.logo ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  companyName
                )}&background=5eb883&color=fff`;

              return (
                <div
                  key={job._id}
                  className="relative overflow-hidden rounded-2xl border border-[#b6e6c8] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-[#e7f8ef] p-3">
                        <img
                          src={companyLogo}
                          alt={companyName}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[#0f3d2e]">
                          {job.title}
                        </h3>
                        <p className="text-[#145a43] font-medium">
                          {companyName}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e7f8ef] px-3 py-1 text-sm text-[#145a43]">
                          <Building className="h-4 w-4" />
                          {job.jobType || "N/A"}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/jobs/${job._id}`}
                      className="rounded-full bg-[#0f3d2e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#145a43]"
                    >
                      Apply Now
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-[#1f5f46] md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{formatLocation(job)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-[#0f3d2e]">
                        {formatSalary(job)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Posted {getTimeAgo(job.postedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>
                        {job.totalApplicants
                          ? `${job.totalApplicants} applicants`
                          : "Be the first applicant"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedJobsSection;
