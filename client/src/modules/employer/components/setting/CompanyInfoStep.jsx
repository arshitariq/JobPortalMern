import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { employerApi } from "@/modules/employer/api/employerApi";
import { env } from "@/shared/config/env";
import { toast } from "sonner";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

// ✅ tiptap
import { TiptapEditor } from "@/shared/editor/tiptap";

export default function CompanyInfoStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [uploading, setUploading] = useState(null);

  const logoUrl = watch("logoUrl");
  const bannerUrl = watch("bannerUrl");
  const aboutValue = watch("about") ?? ""; // HTML

  const normalizeImageUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;

    const apiBase = env.API_URL.replace(/\/api$/, "");
    const normalized = value.startsWith("/") ? value : `/${value}`;
    return `${apiBase}${normalized}`;
  };

  const uploadImage = async (type, file) => {
    if (!file) return;

    try {
      setUploading(type);

      const payload = {};
      if (type === "logo") payload.logo = file;
      if (type === "banner") payload.banner = file;

      const res = await employerApi.upload(payload);

      if (res.status !== "SUCCESS") {
        return toast.error(res.message || "Failed to upload image");
      }

      if (type === "logo" && res.data?.logoUrl) {
        setValue("logoUrl", res.data.logoUrl, { shouldDirty: true });
      }
      if (type === "banner" && res.data?.bannerUrl) {
        setValue("bannerUrl", res.data.bannerUrl, { shouldDirty: true });
      }

      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Something went wrong while uploading");
    } finally {
      setUploading((prev) => (prev === type ? null : prev));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(type, file);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="space-y-8">
      {/* Logo + Banner section */}
      <div className="space-y-4">
        <h3 className="text-base font-medium">Logo &amp; Banner Image</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Logo card */}
          <div className="space-y-2">
            <Label>Upload Logo</Label>
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-6 text-center cursor-pointer"
              onDrop={(e) => handleDrop(e, "logo")}
              onDragOver={handleDragOver}
            >
              {logoUrl ? (
                <img
                  src={normalizeImageUrl(logoUrl)}
                  alt="logo"
                  className="h-16 object-contain"
                />
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">
                    Browse photo or drop here
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A photo larger than 400px works best. Max photo size 5 MB.
                  </p>
                </>
              )}

              <Input
                type="file"
                accept="image/*"
                className="mt-2 w-full text-xs"
                disabled={uploading === "logo"}
                onChange={(e) =>
                  uploadImage("logo", e.target.files?.[0] || null)
                }
              />

              {uploading === "logo" && (
                <span className="text-xs text-muted-foreground">
                  Uploading logo…
                </span>
              )}
            </div>
          </div>

          {/* Banner card */}
          <div className="space-y-2">
            <Label>Banner Image</Label>
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-6 text-center cursor-pointer"
              onDrop={(e) => handleDrop(e, "banner")}
              onDragOver={handleDragOver}
            >
              {bannerUrl ? (
                <img
                  src={normalizeImageUrl(bannerUrl)}
                  alt="banner"
                  className="h-24 w-full rounded-md object-cover"
                />
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">
                    Browse photo or drop here
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Banner images optimal dimension 1520×400. Supported JPEG,
                    PNG. Max photo size 5 MB.
                  </p>
                </>
              )}

              <Input
                type="file"
                accept="image/*"
                className="mt-2 w-full text-xs"
                disabled={uploading === "banner"}
                onChange={(e) =>
                  uploadImage("banner", e.target.files?.[0] || null)
                }
              />

              {uploading === "banner" && (
                <span className="text-xs text-muted-foreground">
                  Uploading banner…
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company name */}
      <div className="space-y-2">
        <Label>Company name</Label>
        <Input placeholder="Company name" {...register("companyName")} />
        {errors.companyName && (
          <p className="text-sm text-destructive">
            {errors.companyName.message}
          </p>
        )}
      </div>

      {/* ✅ About Us (Tiptap Editor) */}
      <div className="space-y-2">
        <Label>About Us</Label>

        <TiptapEditor
          content={aboutValue}
          onChange={(html) =>
            setValue("about", html, { shouldDirty: true, shouldTouch: true })
          }
        />

        {errors.about && (
          <p className="text-sm text-destructive">{errors.about.message}</p>
        )}
      </div>
    </div>
  );
}
