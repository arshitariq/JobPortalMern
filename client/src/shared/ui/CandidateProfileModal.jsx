import React from "react";
import {
  X,
  Bookmark,
  Mail,
  CalendarDays,
  Flag,
  HeartHandshake,
  User,
  Briefcase,
  GraduationCap,
  Download,
  Globe,
  MapPin,
  Phone,
  AtSign,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { env } from "@/shared/config/env";

const SOCIAL_ICON_MAP = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
};

const buildMediaUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const apiBase = env.API_URL.replace(/\/api$/, "");
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${apiBase}${normalized}`;
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "Not provided";

const fallbackAvatar = (name = "Candidate") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E0E7FF&color=312E81`;

const normalizeCandidate = (candidate) => {
  const name = candidate.fullName || candidate.name || "Unnamed Candidate";
  const title = candidate.headline || candidate.role || "Add headline";
  const location = candidate.location || candidate.mapLocation || "Not provided";
  const avatar = buildMediaUrl(candidate.avatarUrl) || fallbackAvatar(name);
  const resumeUrl = candidate.resumeUrl ? buildMediaUrl(candidate.resumeUrl) : "";
  const resumeFileName = candidate.resumeUrl
    ? decodeURIComponent(candidate.resumeUrl.split("/").pop() || "Resume.pdf")
    : "Resume not uploaded";
  const resumeType = resumeFileName.split(".").pop()?.toUpperCase() || "N/A";

  return {
    name,
    title,
    avatar,
    biography:
      candidate.biography || "This candidate has not added a biography yet.",
    coverLetter:
      candidate.coverLetter ||
      "This candidate has not provided a cover letter.",
    overview: {
      dob: formatDate(candidate.dateOfBirth),
      nationality: candidate.nationality || "Not provided",
      maritalStatus: candidate.maritalStatus || "Not provided",
      gender: candidate.gender || "Not provided",
      experience: candidate.experience || "Not provided",
      education: candidate.education || "Not provided",
    },
    resume: {
      fileName: resumeFileName,
      type: resumeType,
      url: resumeUrl,
    },
    contact: {
      website: candidate.websiteUrl || "Not provided",
      location,
      addressLine: candidate.mapLocation || "",
      phone: candidate.phone || "Not provided",
      email: candidate.contactEmail || "Not provided",
    },
    socialLinks: (candidate.socialLinks || [])
      .filter((link) => link?.url)
      .map((link) => {
        const key = String(link.platform || "").toLowerCase();
        return {
          platform: link.platform || "Social",
          url: link.url,
          Icon: SOCIAL_ICON_MAP[key] || Globe,
        };
      }),
  };
};

function InfoCell({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 rounded-md p-2">
      <div className="mt-0.5 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function SocialLinkButton({ Icon, label, href }) {
  const Component = href ? "a" : "button";
  return (
    <Component
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-muted"
      aria-label={label}
      {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
    >
      <Icon className="h-4 w-4" />
    </Component>
  );
}

export default function CandidateProfileModal({
  open,
  onOpenChange,
  candidate,
}) {
  const normalized = candidate ? normalizeCandidate(candidate) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0">
        {!normalized ? (
          <div className="p-6 text-sm text-muted-foreground">
            Select a candidate to view their profile.
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              <DialogHeader className="space-y-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <img
                      src={normalized.avatar}
                      alt={normalized.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <DialogTitle className="text-base font-semibold">
                        {normalized.name}
                      </DialogTitle>
                      <div className="text-xs text-muted-foreground">
                        {normalized.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" aria-label="Save">
                      <Bookmark className="h-4 w-4" />
                    </Button>

                    {normalized.contact.email !== "Not provided" && (
                      <Button
                        className="gap-2"
                        asChild
                        title={`Email ${normalized.contact.email}`}
                      >
                        <a href={`mailto:${normalized.contact.email}`}>
                          <Mail className="h-4 w-4" />
                          Send Mail
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <Separator className="my-5" />

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                      Biography
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {normalized.biography}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                      Cover Letter
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {normalized.coverLetter}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                      Social Links
                    </h3>
                    {normalized.socialLinks.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {normalized.socialLinks.map((link) => (
                          <SocialLinkButton
                            key={`${link.platform}-${link.url}`}
                            Icon={link.Icon}
                            label={link.platform}
                            href={link.url}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        No social links provided.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="bg-background">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <InfoCell
                          icon={CalendarDays}
                          label="Date of Birth"
                          value={normalized.overview.dob}
                        />
                        <InfoCell
                          icon={Flag}
                          label="Nationality"
                          value={normalized.overview.nationality}
                        />
                        <InfoCell
                          icon={HeartHandshake}
                          label="Marital Status"
                          value={normalized.overview.maritalStatus}
                        />
                        <InfoCell
                          icon={User}
                          label="Gender"
                          value={normalized.overview.gender}
                        />
                        <InfoCell
                          icon={Briefcase}
                          label="Experience"
                          value={normalized.overview.experience}
                        />
                        <InfoCell
                          icon={GraduationCap}
                          label="Education"
                          value={normalized.overview.education}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background">
                    <CardContent className="p-4">
                      <div className="text-sm font-semibold">
                        Download My Resume
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {normalized.resume.fileName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {normalized.resume.type}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Download"
                          disabled={!normalized.resume.url}
                          asChild={Boolean(normalized.resume.url)}
                        >
                          {normalized.resume.url ? (
                            <a href={normalized.resume.url} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background">
                    <CardContent className="p-4 space-y-3">
                      <div className="text-sm font-semibold">
                        Contact Information
                      </div>

                      <div className="flex items-start gap-2">
                        <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-[11px] uppercase text-muted-foreground">
                            Website
                          </div>
                          <div className="font-medium break-all">
                            {normalized.contact.website}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-[11px] uppercase text-muted-foreground">
                            Location
                          </div>
                          <div className="font-medium">{normalized.contact.location}</div>
                          {normalized.contact.addressLine && (
                            <div className="text-xs text-muted-foreground">
                              {normalized.contact.addressLine}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-[11px] uppercase text-muted-foreground">
                            Phone
                          </div>
                          <div className="font-medium">
                            {normalized.contact.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <AtSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-[11px] uppercase text-muted-foreground">
                            Email Address
                          </div>
                          <div className="font-medium break-all">
                            {normalized.contact.email}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
