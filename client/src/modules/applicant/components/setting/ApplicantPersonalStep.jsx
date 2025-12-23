// src/modules/applicant/components/setting/ApplicantPersonalStep.jsx
import { useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import {
  UploadCloud,
  Link as LinkIcon,
  FileText,
  MoreHorizontal,
} from "lucide-react";

import { env } from "@/shared/config/env";
import { applicantApi } from "@/modules/applicant/api/applicantApi";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export default function ApplicantPersonalStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [uploading, setUploading] = useState(null); // "avatar" | "banner" | "resume" | null

  const avatarUrl = watch("avatarUrl");
  const bannerUrl = watch("bannerUrl");
  const resumeUrl = watch("resumeUrl");

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const normalizeImageUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;

    const apiBase = env.API_URL.replace(/\/api$/, "");
    const normalized = value.startsWith("/") ? value : `/${value}`;
    return `${apiBase}${normalized}`;
  };

  const uploadFile = async (type, file) => {
    if (!file) return;

    try {
      setUploading(type);

      const payload = {};
      if (type === "avatar") payload.avatar = file;
      if (type === "banner") payload.banner = file;
      if (type === "resume") payload.resume = file;

      const res = await applicantApi.upload(payload);

      if (res.status !== "SUCCESS") {
        return toast.error(res.message || "Failed to upload file");
      }

      if (type === "avatar" && res.data?.avatarUrl) {
        setValue("avatarUrl", res.data.avatarUrl, { shouldDirty: true });
      }
      if (type === "banner" && res.data?.bannerUrl) {
        setValue("bannerUrl", res.data.bannerUrl, { shouldDirty: true });
      }
      if (type === "resume" && res.data?.resumeUrl) {
        setValue("resumeUrl", res.data.resumeUrl, { shouldDirty: true });
      }

      toast.success("File uploaded");
    } catch (err) {
      toast.error("Something went wrong while uploading");
    } finally {
      setUploading((prev) => (prev === type ? null : prev));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(type, file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const resumeFileName = useMemo(() => {
    if (!resumeUrl) return "";
    try {
      const parts = resumeUrl.split("/");
      return decodeURIComponent(parts[parts.length - 1] || "Resume.pdf");
    } catch {
      return "Resume.pdf";
    }
  }, [resumeUrl]);

  return (
    <div className="space-y-8">
      {/* ---------- Basic Information ---------- */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Basic Information</h3>

        <div className="grid gap-8 md:grid-cols-[280px,1fr]">
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div
                className="group flex h-60 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center transition hover:border-primary hover:bg-primary/5"
                onDrop={(e) => handleDrop(e, "avatar")}
                onDragOver={handleDragOver}
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img
                    src={normalizeImageUrl(avatarUrl)}
                    alt="avatar"
                    className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/30"
                  />
                ) : (
                  <UploadCloud className="h-12 w-12 text-muted-foreground group-hover:text-primary" />
                )}

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Browse photo or drop here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    A photo larger than 80k pixels works best. Max photo size 5 MB.
                  </p>
                </div>

                <Input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading === "avatar"}
                  onChange={(e) =>
                    uploadFile("avatar", e.target.files?.[0] || null)
                  }
                />

                {uploading === "avatar" && (
                  <span className="text-xs text-muted-foreground">
                    Uploading photo...
                  </span>
                )}
              </div>
            </div>

            {/* Banner Image */}
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div
                className="group flex h-36 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center transition hover:border-primary hover:bg-primary/5"
                onDrop={(e) => handleDrop(e, "banner")}
                onDragOver={handleDragOver}
                onClick={() => bannerInputRef.current?.click()}
              >
                {bannerUrl ? (
                  <img
                    src={normalizeImageUrl(bannerUrl)}
                    alt="banner"
                    className="h-full w-full rounded-xl object-cover shadow"
                  />
                ) : (
                  <UploadCloud className="h-10 w-10 text-muted-foreground group-hover:text-primary" />
                )}

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Upload a profile cover image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended 1500x400px JPG or PNG (max 5 MB).
                  </p>
                </div>

                <Input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading === "banner"}
                  onChange={(e) =>
                    uploadFile("banner", e.target.files?.[0] || null)
                  }
                />

                {uploading === "banner" && (
                  <span className="text-xs text-muted-foreground">
                    Uploading banner...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input placeholder="Esther Howard" {...register("fullName")} />
                {errors.fullName && (
                  <p className="text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Title / headline</Label>
                <Input
                  placeholder="Senior UX Designer"
                  {...register("headline")}
                />
                {errors.headline && (
                  <p className="text-xs text-destructive">
                    {errors.headline.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Personal Website</Label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://www.your-portfolio.com"
                  {...register("websiteUrl")}
                />
              </div>
              {errors.websiteUrl && (
                <p className="text-xs text-destructive">
                  {errors.websiteUrl.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Your CV / Resume ---------- */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Your CV / Resume</h3>

        <div className="grid gap-4 md:grid-cols-3">
          {resumeUrl && (
            <div className="rounded-2xl border bg-background p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="max-w-[150px] truncate font-medium">
                      {resumeFileName || "Uploaded Resume"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF document</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  title="Resume actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  View resume
                </a>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Upload a new PDF to replace
                </span>
              </div>
            </div>
          )}

          <div
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center transition hover:border-primary hover:bg-primary/5"
            onDrop={(e) => handleDrop(e, "resume")}
            onDragOver={handleDragOver}
            onClick={() => resumeInputRef.current?.click()}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm font-medium">
              {resumeUrl ? "Replace CV / Resume" : "Add CV / Resume"}
            </div>
            <p className="text-xs text-muted-foreground">
              Browse file or drop here. Only PDF, max size 5 MB.
            </p>

            <Input
              ref={resumeInputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              disabled={uploading === "resume"}
              onChange={(e) =>
                uploadFile("resume", e.target.files?.[0] || null)
              }
            />

            {uploading === "resume" && (
              <span className="text-xs text-muted-foreground">
                Uploading resume...
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
