// src/app/pages/FindJob/FindJobPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building,
  Clock,
  Search,
  Filter,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { jobsApi } from "@/modules/jobs/api/jobsApi";

const JOBS_PER_PAGE = 9;
const filterDefaults = {
  search: "",
  jobType: "",
  remote: false,
  experience: "",
};

export default function FindJobPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(() => ({ ...filterDefaults }));
  const [pagination, setPagination] = useState({
    page: 1,
    limit: JOBS_PER_PAGE,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    let isActive = true;

    const loadJobs = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: JOBS_PER_PAGE,
        };

        if (filters.search.trim()) {
          params.search = filters.search.trim();
        }

        if (filters.jobType) {
          params.jobType = filters.jobType;
        }

        if (filters.experience) {
          params.experienceLevel = filters.experience;
        }

        if (filters.remote) {
          params.remote = "true";
        }

        const res = await jobsApi.list(params);
        if (!isActive) return;
        if (res?.status === "SUCCESS") {
          setJobs(res.data?.jobs || []);
          const paginationData = res.data?.pagination || {};
          setPagination({
            page: paginationData.page || currentPage,
            limit: paginationData.limit || JOBS_PER_PAGE,
            total: paginationData.total || 0,
            pages: paginationData.pages || 1,
          });
          setError(null);
        } else {
          setError(res?.message || "Failed to load jobs");
          setJobs([]);
        }
      } catch (err) {
        if (!isActive) return;
        console.error("Failed to load jobs", err);
        setError("Failed to load jobs");
        setJobs([]);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    loadJobs();

    return () => {
      isActive = false;
    };
  }, [
    currentPage,
    filters.search,
    filters.jobType,
    filters.remote,
    filters.experience,
  ]);

  const totalPages = Math.max(pagination.pages, 1);
  const showingStart = pagination.total
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const showingEnd = pagination.total
    ? Math.min(showingStart + jobs.length - 1, pagination.total)
    : 0;
  const statsLabel =
    pagination.total > 0
      ? `Showing ${showingStart}-${showingEnd} of ${pagination.total} jobs`
      : "No jobs found yet";

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
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  }, []);

  const handleTagClick = useCallback((tag) => {
    setFilters((prev) => ({ ...prev, search: tag }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...filterDefaults });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (pageNumber) => {
      const nextPage = Math.max(1, Math.min(totalPages, pageNumber));
      setCurrentPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  const renderPagination = useMemo(() => {
    const pages = [];

    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    );

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-4 py-2 border border-gray-300 rounded-lg ${
              currentPage === i
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={i} className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    );

    return pages;
  }, [currentPage, totalPages, handlePageChange]);

  return (
    <div className="bg-[#c1fbd9] min-h-screen">
      {/* Hero Section */}
      <div className="text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
               <span className="text-green-950"> Find Your Dream Job</span>
            </h1>
            <p className="text-xl text-green-600/90 max-w-3xl mx-auto">
              Browse thousands of job opportunities from top companies worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or keyword..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-6">
                {/* Job Type Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Job Type</h3>
                  <div className="space-y-2">
                    {["Full-time", "Contract", "Part-time", "Internship"].map(
                      (type) => (
                        <label key={type} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="jobType"
                            checked={filters.jobType === type}
                            onChange={() => handleFilterChange("jobType", type)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-gray-700">{type}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Remote Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.remote}
                      onChange={(e) =>
                        handleFilterChange("remote", e.target.checked)
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                    />
                    <span className="ml-2 text-gray-700">Remote only</span>
                  </label>
                </div>

                {/* Experience Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Experience Level
                  </h3>
                  <div className="space-y-2">
                    {["Entry", "Mid", "Senior", "Executive"].map((level) => (
                      <label key={level} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="experience"
                          checked={filters.experience === level}
                          onChange={() => handleFilterChange("experience", level)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-gray-700">{level} Level</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Remote", "Python", "AWS", "UI/UX"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1 bg-blue-50 text-green-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            {/* Stats Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">
                    {pagination.total} Jobs Found
                  </span>
                  <span className="text-sm text-gray-500">
                    {filters.search ? `for "${filters.search}"` : "All jobs"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Page {pagination.page} of {totalPages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{statsLabel}</span>
                </div>
              </div>
            </div>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-200 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters to find what you're looking
                  for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Job Grid - 3 cards per row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {jobs.map((job) => {
                    const companyName =
                      job.employer?.companyName || "Unknown Company";
                    const companyLogo =
                      job.employer?.logo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        companyName
                      )}&background=4F46E5&color=fff`;
                    const jobTags = job.tags || [];
                    return (
                      <div
                        key={job._id}
                        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-green-300"
                      >
                        {/* Company Logo and Title */}
                        <div className="flex items-start gap-4 mb-4">
                          <img
                            src={companyLogo}
                            alt={companyName}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                              {job.title}
                            </h3>
                            <p className="text-green-600 font-medium text-sm truncate">
                              {companyName}
                            </p>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{formatLocation(job)}</span>
                            {job.isRemote && (
                              <Globe className="h-4 w-4 text-green-500" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium text-green-700">
                              {formatSalary(job)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>{job.jobType}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{getTimeAgo(job.postedAt)}</span>
                          </div>
                        </div>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {jobTags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {jobTags.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                              +{jobTags.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Apply Button */}
                        <Link
                          to={`/jobs/${job._id}`}
                          className="block w-full py-3 bg-green-600 text-white text-center font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-200">
                    <div className="text-sm text-gray-600">{statsLabel}</div>
                    <div className="flex items-center gap-2">{renderPagination}</div>
                    <div className="text-sm text-gray-500">
                      {pagination.limit} jobs per page
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
