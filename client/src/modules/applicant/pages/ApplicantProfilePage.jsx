import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Globe,
  Briefcase,
  GraduationCap,
  Calendar,
  User,
  Heart,
  Users,
  FileText,
  Bell,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

import { applicantApi } from "../api/applicantApi";
import { env } from "@/shared/config/env";

const normalizeImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const apiBase = env.API_URL.replace(/\/api$/, "");
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${apiBase}${normalized}`;
};

export default function ModernProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await applicantApi.me();
        if (res?.status === "SUCCESS") {
          setProfileData(res.data || null);
        } else {
          setProfileData(null);
          toast.error(res?.message || "Failed to load profile");
        }
      } catch (err) {
        setProfileData(null);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const ensureValue = (value, fallback = "Not provided") =>
    value ? value : fallback;

  const safeSkills = Array.isArray(profileData?.skills)
    ? profileData.skills.filter(Boolean)
    : [];
  const safeSocialLinks = Array.isArray(profileData?.socialLinks)
    ? profileData.socialLinks
    : [];

  const formattedDob = profileData?.dateOfBirth
    ? new Date(profileData.dateOfBirth).toLocaleDateString()
    : "Not provided";

  const bannerUrl = normalizeImageUrl(profileData?.bannerUrl);
  const avatarUrl = normalizeImageUrl(profileData?.avatarUrl);
  const avatarInitial = (
    profileData?.fullName ||
    profileData?.headline ||
    "Profile"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center text-gray-600">
        <p>No profile data found. Please complete your profile settings.</p>
        <button
          onClick={() => navigate("/applicant/settings")}
          className="px-4 py-2 rounded-lg bg-[#5eb883] text-white text-sm font-medium hover:bg-[#4e9b6e] transition"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Card with Cover */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-48 relative">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={`${ensureValue(profileData.fullName, "Profile")} cover`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-[#c1fbd9] via-[#5eb883] to-[#799a87]" />
            )}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Header */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative -mt-16 md:-mt-20">
                <div className="w-40 h-40 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-[#c1fbd9] to-[#5eb883]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profileData.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                      {avatarInitial || "A"}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white"></div>
              </div>
              {/* Name and Headline */}
              <div className="flex-1 pt-4 md:pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {ensureValue(profileData.fullName, "Incomplete Profile")}
                    </h1>
                    <p className="text-lg text-gray-700 mb-3">
                      {ensureValue(
                        profileData.headline,
                        "Add a professional headline from Settings"
                      )}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#5eb883]" />
                        {ensureValue(profileData.location)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4 text-[#799a87]" />
                        {ensureValue(profileData.experience)}
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-[#c1fbd9]" />
                        {ensureValue(profileData.education)}
                      </div>
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-[#5eb883] text-white rounded-lg hover:bg-[#4e9b6e] transition"
                    onClick={() => navigate("/applicant/settings")}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 border-b border-gray-200">
              {["overview", "contact", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize transition rounded-t-lg ${
                    activeTab === tab
                      ? "text-[#5eb883] bg-[#c1fbd9] border-b-2 border-[#5eb883]"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Info</h3>
              <div className="space-y-3">
                <InfoItem
                  icon={<User className="w-4 h-4 text-[#5eb883]" />}
                  label="Gender"
                  value={ensureValue(profileData.gender)}
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4 text-[#799a87]" />}
                  label="Date of Birth"
                  value={formattedDob}
                />
                <InfoItem
                  icon={<Heart className="w-4 h-4 text-[#c1fbd9]" />}
                  label="Marital Status"
                  value={ensureValue(profileData.maritalStatus)}
                />
                <InfoItem
                  icon={<Users className="w-4 h-4 text-[#5eb883]" />}
                  label="Nationality"
                  value={ensureValue(profileData.nationality)}
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {profileData.websiteUrl && (
                  <a href={profileData.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#5eb883] hover:text-[#4e9b6e] text-sm">
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {profileData.resumeUrl && (
                  <a href={profileData.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#5eb883] hover:text-[#4e9b6e] text-sm">
                    <FileText className="w-4 h-4" />
                    View Resume
                  </a>
                )}
                {safeSocialLinks.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[#5eb883] hover:text-[#4e9b6e] text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Biography */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    About
                  </h3>
                  {profileData.biography ? (
                    <div
                      className="text-gray-700 leading-relaxed space-y-3 [&_p]:mt-0 [&_strong]:font-semibold"
                      dangerouslySetInnerHTML={{
                        __html: profileData.biography,
                      }}
                    />
                  ) : (
                    <p className="text-gray-500">
                      You haven't added a biography yet.
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                  {safeSkills.length ? (
                    <div className="flex flex-wrap gap-2">
                      {safeSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 bg-gradient-to-r from-[#c1fbd9] via-[#5eb883] to-[#799a87] text-white rounded-full text-sm font-medium border border-[#5eb883]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </>
            )}

            {activeTab === "contact" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4 text-[#5eb883]" />
                      Email
                    </div>
                    <p className="text-gray-900 ml-6">
                      {ensureValue(profileData.contactEmail)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Phone className="w-4 h-4 text-[#5eb883]" />
                      Phone
                    </div>
                    <p className="text-gray-900 ml-6">
                      {ensureValue(profileData.phone)}
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4 text-[#5eb883]" />
                      Location
                    </div>
                    <p className="text-gray-900 ml-6">
                      {ensureValue(profileData.mapLocation)}
                    </p>
                  </div>
                </div>

                {/* Job Alerts */}
                <div className="mt-8 p-4 bg-[#c1fbd9] rounded-lg border border-[#5eb883]">
                  <h4 className="font-semibold text-gray-900 mb-3">Job Alert Preferences</h4>
                  <div className="grid gap-3 md:grid-cols-2 text-sm">
                    <div>
                      <span className="text-gray-700">Role:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {ensureValue(profileData.alertRole)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {ensureValue(profileData.alertLocation)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Bell className="w-5 h-5 text-[#5eb883]" />
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="space-y-3">
                    <NotificationToggle label="Shortlisted by employers" enabled={Boolean(profileData.notifyShortlisted)} />
                    <NotificationToggle label="Profile saved" enabled={Boolean(profileData.notifySavedProfile)} />
                    <NotificationToggle label="Applied jobs expired" enabled={Boolean(profileData.notifyAppliedExpired)} />
                    <NotificationToggle label="Rejected by employers" enabled={Boolean(profileData.notifyRejected)} />
                    <NotificationToggle label="Job alert limit (5+)" enabled={Boolean(profileData.notifyJobAlertLimit)} />
                  </div>
                </div>

                {/* Privacy */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Eye className="w-5 h-5 text-[#5eb883]" />
                    <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <PrivacyToggle 
                      label="Profile Public" 
                      description="Your profile on public search" 
                      enabled={Boolean(profileData.profilePublic)} 
                    />
                    <PrivacyToggle 
                      label="Resume Public" 
                      description="Control who can view your resume" 
                      enabled={Boolean(profileData.resumePublic)} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[#5eb883]">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function NotificationToggle({ label, enabled }) {
  return (
    <div className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <div className={`w-10 h-5 rounded-full ${enabled ? 'bg-[#5eb883]' : 'bg-gray-300'} relative`}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
      </div>
    </div>
  );
}

function PrivacyToggle({ label, description, enabled }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-600 mt-1">{description}</div>
      </div>
      <div className={`w-12 h-6 rounded-full ${enabled ? 'bg-[#799a87]' : 'bg-gray-300'} relative`}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
      </div>
    </div>
  );
}
