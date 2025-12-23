// src/modules/employer/pages/EmployerProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { employerApi } from "@/modules/employer/api/employerApi";
import { toast } from "sonner";
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  Globe,
  Phone,
  Mail,
} from "lucide-react";

function normalizeWebsite(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function initials(name = "Company") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "C";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export default function EmployerProfilePage() {
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await employerApi.me();
        if (res.status === "SUCCESS") {
          setEmployer(res.data);
        } else {
          setError(res.message || "Failed to load profile");
        }
      } catch (e) {
        console.error(e);
        setError("Something went wrong while loading profile");
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const websiteHref = useMemo(
    () => normalizeWebsite(employer?.websiteUrl),
    [employer?.websiteUrl]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-7 w-56 rounded-md bg-muted" />
        <div className="h-56 rounded-xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-48 rounded-xl bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl rounded-xl border bg-card p-5">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!employer) return null;

  const companyName = employer.companyName || "Company";
  const companyInitials = initials(companyName);

  const socialLinks = Array.isArray(employer.socialLinks)
    ? employer.socialLinks
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Employer Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This is how candidates will see your company.
          </p>
        </div>

        {/* ✅ Settings link */}
        <Link
          to="/employer/settings"
          className="inline-flex items-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Go to Settings
        </Link>
      </div>

      {/* Hero card */}
      <div className="relative rounded-xl border bg-card shadow-sm">
        {/* Banner */}
        <div className="relative h-44 w-full overflow-hidden rounded-t-xl bg-muted md:h-60">
          {employer.bannerUrl ? (
            <img
              src={employer.bannerUrl}
              alt="Company banner"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Banner image not added
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
        </div>

        {/* ✅ Content area (Logo + Name same line) */}
        <div className="px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            {/* Left: logo + title row */}
            <div className="flex items-center gap-4 mt-12 md:mt-0 min-w-0">
              {/* Logo */}
              <div className="h-20 w-20 md:h-24 md:w-24  rounded-full border-4 border-background bg-muted shadow-md overflow-hidden -mt-12 md:-mt-2">
                {employer.logoUrl ? (
                  <img
                    src={employer.logoUrl}
                    alt={companyName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                    {companyInitials}
                  </div>
                )}
              </div>

              {/* Company name + meta */}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold md:text-2xl">
                  {companyName}
                </h2>

                {/* chips */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {employer.industryType && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                      <Building2 className="h-3.5 w-3.5 text-blue-600" />
                      <span>{employer.industryType}</span>
                    </span>
                  )}
                  {employer.organizationType && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{employer.organizationType}</span>
                    </span>
                  )}
                  {employer.teamSize && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-purple-700">
                      <Users className="h-3.5 w-3.5 text-purple-600" />
                      <span>{employer.teamSize} employees</span>
                    </span>
                  )}
                  {employer.yearOfEstablishment && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" />
                      <span>Est. {employer.yearOfEstablishment}</span>
                    </span>
                  )}
                </div>

                {/* meta */}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {employer.mapLocation && (
                    <div className="flex items-center gap-1 text-rose-600">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{employer.mapLocation}</span>
                    </div>
                  )}
                  {websiteHref && (
                    <a
                      href={websiteHref}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sky-600 hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span className="truncate">{employer.websiteUrl}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex gap-2 md:justify-end">
              {websiteHref && (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  Visit website
                </a>
              )}
              {employer.contactEmail && (
                <a
                  href={`mailto:${employer.contactEmail}`}
                  className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Contact
                </a>
              )}
            </div>
          </div>

          <div className="mt-5 border-t" />
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Left */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">About</h3>
              <span className="text-xs text-muted-foreground">Overview</span>
            </div>
            {employer.about ? (
              <div
                className="text-sm leading-relaxed text-foreground/90 space-y-3 [&_p]:mt-0 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: employer.about }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No description added yet.
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Company Vision</h3>
              <span className="text-xs text-muted-foreground">Mission</span>
            </div>
            {employer.companyVision ? (
              <div
                className="text-sm leading-relaxed text-foreground/90 space-y-3 [&_p]:mt-0 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: employer.companyVision }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No vision statement added yet.
              </p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Contact</h3>
            <div className="mt-3 space-y-3 text-sm">
              {employer.phone ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${employer.phone}`} className="hover:underline">
                    {employer.phone}
                  </a>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Phone not added</div>
              )}

              {employer.contactEmail ? (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${employer.contactEmail}`}
                    className="break-all hover:underline"
                  >
                    {employer.contactEmail}
                  </a>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Email not added</div>
              )}

              {employer.location ? (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{employer.location}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Location not added</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Social Links</h3>
            {socialLinks.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={(link.platform || "link") + link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted"
                  >
                    {link.platform || "Link"}
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No social links added.
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Quick Facts</h3>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <span>Industry</span>
                <span className="text-foreground/90">{employer.industryType || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Organization</span>
                <span className="text-foreground/90">{employer.organizationType || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Team size</span>
                <span className="text-foreground/90">{employer.teamSize || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Established</span>
                <span className="text-foreground/90">{employer.yearOfEstablishment || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>City</span>
                <span className="text-foreground/90">{employer.mapLocation || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
        Want to update this information? Go to{" "}
        <Link to="/employer/settings" className="font-medium text-foreground hover:underline">
          Settings
        </Link>
        .
      </div>
    </div>
  );
}
