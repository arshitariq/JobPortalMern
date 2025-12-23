import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  Bookmark, 
  Briefcase, 
  Building, 
  Calendar, 
  Copy, 
  GraduationCap, 
  MapPin, 
  Tag, 
  DollarSign,
  Globe,
  Clock,
  Award,
  Shield,
  Users,
  ArrowLeft,
  Share2,
  CheckCircle
} from "lucide-react";
import ApplyJobModal from "@/shared/ui/ApplyJobModal";
import { jobsApi } from "@/modules/jobs/api/jobsApi";
import { applicantApi } from "@/modules/applicant/api/applicantApi";
import { toast } from "sonner";
import { useAppSelector } from "@/app/hooks";

const formatSalary = (job) => {
  const min = Number(job?.minSalary);
  const max = Number(job?.maxSalary);
  if (!Number.isNaN(min) && !Number.isNaN(max) && min > 0 && max > 0) {
    const currency = job?.salaryCurrency || "USD";
    const unit =
      job?.salaryType === "year"
        ? " / year"
        : job?.salaryType === "month"
        ? " / month"
        : "";
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}${unit}`;
  }
  return "Salary not disclosed";
};

const formatLocation = (job) => {
  if (job?.isRemote) return "Remote";
  if (job?.city && job?.country) return `${job.city}, ${job.country}`;
  return job?.location || "Location not specified";
};

const formatDate = (value) => {
  if (!value) return "Not specified";
  return new Date(value).toLocaleDateString();
};

const AuthPrompt = () => (
  <div className="mt-4 space-y-3 rounded-xl border border-dashed border-green-200 bg-green-50 px-5 py-4 text-center text-sm text-green-900">
    <p className="text-sm font-semibold">Please log in or register to submit your application.</p>
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      <Link
        to="/auth/login"
        className="rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50"
      >
        Log In
      </Link>
      <Link
        to="/auth/register"
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Register
      </Link>
    </div>
  </div>
);

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [promptLocation, setPromptLocation] = useState(null);
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeOptions, setResumeOptions] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const user = useAppSelector((state) => state.auth.user);
  const isApplicant = user?.role === "applicant";

  const fetchJob = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) setLoading(true);
      try {
        const res = await jobsApi.get(jobId);
        if (res?.status === "SUCCESS") {
          setJob(res.data);
          setError(null);
        } else {
          setError(res?.message || "Job not found");
          setJob(null);
        }
      } catch {
        setError("Job not found");
        setJob(null);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [jobId]
  );

  useEffect(() => {
    fetchJob({ showLoading: true });
  }, [fetchJob]);

  useEffect(() => {
    if (user) {
      setShowAuthPrompt(false);
      setPromptLocation(null);
    }
  }, [user]);

  useEffect(() => {
    if (!isApplicant) {
      setApplied(false);
      setCandidateProfile(null);
      setResumeOptions([]);
      setSelectedResumeId("");
      return;
    }

    let isActive = true;

    applicantApi
      .getJobEngagement(jobId)
      .then((res) => {
        if (!isActive) return;
        if (res.status === "SUCCESS") {
          setApplied(Boolean(res.data?.hasApplied));
        }
      })
      .catch((err) => {
        console.error("Failed to load job engagement", err);
      });

    const loadProfile = async () => {
      try {
        const profileRes = await applicantApi.me();
        if (!isActive) return;
        if (profileRes.status === "SUCCESS") {
          const data = profileRes.data;
          setCandidateProfile(data);
          const resumeUrl = data?.resumeUrl || "";
          if (resumeUrl) {
            const option = {
              id: resumeUrl,
              label: data?.resumeName || "Latest Resume",
              url: resumeUrl,
            };
            setResumeOptions([option]);
            setSelectedResumeId(option.id);
          } else {
            setResumeOptions([]);
            setSelectedResumeId("");
          }
        }
      } catch (err) {
        console.error("Failed to load applicant profile", err);
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [jobId, isApplicant]);

  const handleSaveJob = () => {
    if (!job) return;
    setSaved(!saved);
  };

  const handleApply = (source) => {
    if (!job) return;

    if (!user) {
      setShowAuthPrompt(true);
      setPromptLocation(source);
      return;
    }

    if (!isApplicant) {
      toast.error("Only applicants can submit job applications.");
      return;
    }

    if (applied) return;

    setApplyModalOpen(true);
  };

  const handleApplyConfirm = async () => {
    if (applied || applying) return;
    if (!isApplicant) {
      toast.error("Only applicants can submit job applications.");
      return;
    }
    setApplying(true);
    try {
      const res = await applicantApi.applyToJob(jobId);
      if (res.status === "SUCCESS") {
        setApplied(true);
        toast.success("Application submitted successfully!");
        setApplyModalOpen(false);
        await fetchJob({ showLoading: false });
      } else {
        toast.error(res.message || "Failed to submit application");
      }
    } catch (err) {
      console.error("Failed to submit application", err);
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    if (!isApplicant) {
      toast.error("Only applicants can upload resumes.");
      return;
    }
    setResumeUploading(true);
    try {
      const res = await applicantApi.uploadResume(file);
      if (res.status === "SUCCESS") {
        toast.success("Resume uploaded");
        const url = res.data?.resumeUrl;
        if (url) {
          const option = {
            id: url,
            label: file.name || "Updated Resume",
            url,
          };
          setResumeOptions([option]);
          setSelectedResumeId(option.id);
          setCandidateProfile((prev) => ({
            ...prev,
            resumeUrl: url,
          }));
        }
      } else {
        toast.error(res.message || "Failed to upload resume");
      }
    } catch (err) {
      console.error("Resume upload failed", err);
      toast.error("Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <p className="text-sm text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
          {error && <p className="text-gray-600">{error}</p>}
          <Link to="/jobs" className="text-green-600 hover:underline">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const companyName =
    job.company?.companyName || job.employer?.companyName || "Company";
  const companyLogo =
    job.company?.logo ||
    job.employer?.logo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      companyName
    )}&background=10B981&color=fff`;
  const tags = job.tags || [];
  const responsibilities = job.responsibilities || [];
  const qualifications = job.qualifications || [];
  const benefits = job.benefits || [];
  const companyDescription =
    job.company?.description ||
    job.employer?.about ||
    "A leading technology company specializing in innovative software solutions.";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-green-100 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Jobs
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-green-100 hover:text-white"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
              <button
                onClick={handleSaveJob}
                className={`flex items-center gap-2 ${
                  saved ? "text-yellow-400" : "text-green-100 hover:text-white"
                }`}
              >
                <Bookmark className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span className="text-lg">{companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{formatLocation(job)}</span>
                  {job.isRemote && <Globe className="h-5 w-5" />}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{job.postedAt ? formatDate(job.postedAt) : "Recently posted"}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-800/30 backdrop-blur-sm rounded-xl p-6 border border-green-700">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{formatSalary(job)}</div>
                <p className="text-green-200">Competitive salary</p>
              </div>
              <button
                onClick={() => handleApply("hero")}
                disabled={applied || applying}
                className={`mt-4 w-full py-3 rounded-lg font-bold ${
                  applied
                    ? "bg-green-600 cursor-default"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                  {applied ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Applied Successfully
                    </span>
                  ) : (
                    "Apply Now"
                  )}
              </button>
                {!user && showAuthPrompt && promptLocation === "hero" && <AuthPrompt />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4 md:pt-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Company</h2>
              <div className="flex items-center gap-4 mb-6">
                <img src={companyLogo} alt={companyName} className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{companyName}</h3>
                  <p className="text-gray-600">{job.company?.industry || job.employer?.industry || "Industry leading company"}</p>
                </div>
              </div>
              {companyDescription ? (
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: companyDescription }}
                />
              ) : (
                <p className="text-gray-700">
                  Learn more about {companyName} by reaching out to the hiring team.
                </p>
              )}
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
              <div className="prose max-w-none text-gray-700">
                {job.description ? (
                  <div
                    className="space-y-3"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                ) : (
                  <p>{job.summary || "Job description not provided."}</p>
                )}

                {responsibilities.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Responsibilities:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {responsibilities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}

                {qualifications.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Qualifications:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {qualifications.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits & Perks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Job Type</span>
                  <span className="font-medium">{job.jobType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">{job.experience || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Education</span>
                  <span className="font-medium">{job.education || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posted On</span>
                  <span className="font-medium">{formatDate(job.postedAt)}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            {tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isApplyModalOpen && (
        <ApplyJobModal
          isOpen={isApplyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={job}
          candidateProfile={candidateProfile}
          resumeOptions={resumeOptions}
          selectedResumeId={selectedResumeId}
          onResumeSelect={(id) => setSelectedResumeId(id)}
          onResumeUpload={handleResumeUpload}
          onApplyConfirm={handleApplyConfirm}
          applying={applying || resumeUploading}
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
        />
      )}
    </>
  );
}
