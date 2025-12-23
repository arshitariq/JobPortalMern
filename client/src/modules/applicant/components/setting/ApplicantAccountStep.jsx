// src/modules/applicant/components/steps/ApplicantAccountStep.jsx
import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PHONE_COUNTRIES } from "@/modules/employer/constants/phoneCountries";

export default function ApplicantAccountStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  // ----- phone handling (same idea as employer ContactStep) -----
  const phoneCountry = watch("phoneCountry");
  const phoneNumber = watch("phoneNumber");

  const selectedCountry = useMemo(
    () => PHONE_COUNTRIES.find((c) => c.key === phoneCountry),
    [phoneCountry]
  );

  useEffect(() => {
    const digitsOnly = (phoneNumber || "").replace(/\D/g, "");
    const full =
      selectedCountry?.code && digitsOnly
        ? `${selectedCountry.code}${digitsOnly}`
        : "";
    setValue("phone", full, { shouldValidate: true, shouldDirty: true });
  }, [phoneNumber, selectedCountry, setValue]);

  // privacy switches
  const profilePublic = !!watch("profilePublic");
  const resumePublic = !!watch("resumePublic");

  const toggleBoolean = (fieldName, current) => {
    setValue(fieldName, !current, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-10">
      {/* CONTACT INFO */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold">Contact Info</h3>

        <div className="space-y-2">
          <Label>Map Location</Label>
          <Input placeholder="Map Location" {...register("mapLocation")} />
          {errors.mapLocation && (
            <p className="text-sm text-destructive">
              {errors.mapLocation.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label>Country</Label>
            <select
              className="w-full h-10 rounded-md border px-3 text-sm"
              {...register("phoneCountry")}
              defaultValue="pak"
            >
              {PHONE_COUNTRIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
            {errors.phoneCountry && (
              <p className="text-sm text-destructive">
                {errors.phoneCountry.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <div className="flex gap-2">
              <Input
                value={selectedCountry?.code || ""}
                disabled
                className="w-24"
              />
              <Input
                placeholder="Phone number"
                inputMode="numeric"
                {...register("phoneNumber")}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
            {/* backend ko yeh final value jayegi */}
            <input type="hidden" {...register("phone")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            placeholder="Email address..."
            {...register("contactEmail")}
          />
          {errors.contactEmail && (
            <p className="text-sm text-destructive">
              {errors.contactEmail.message}
            </p>
          )}
        </div>
      </section>

      {/* NOTIFICATION CHECKBOXES */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Notification</h3>

        <div className="grid gap-2 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              {...register("notifyShortlisted")}
            />
            <span>Notify me when employers shortlisted me</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              {...register("notifySavedProfile")}
            />
            <span>Notify me when employers saved my profile</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              {...register("notifyAppliedExpired")}
            />
            <span>Notify me when my applied jobs are expire</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              {...register("notifyRejected")}
            />
            <span>Notify me when employers rejected me</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              {...register("notifyJobAlertLimit")}
            />
            <span>Notify me when I have up to 5 job alerts</span>
          </label>
        </div>
      </section>

      {/* JOB ALERT PREFERENCES */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Job Alerts</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              placeholder="Your job role"
              {...register("alertRole")}
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="City, state, country name"
              {...register("alertLocation")}
            />
          </div>
        </div>
      </section>

      {/* PRIVACY SWITCHES */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold">Privacy</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Profile Privacy */}
          <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <div>
              <div className="font-medium">Profile Privacy</div>
              <div className="text-xs text-muted-foreground">
                Your profile on public search.
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleBoolean("profilePublic", profilePublic)}
              className={
                "relative inline-flex h-6 w-12 items-center rounded-full border transition " +
                (profilePublic ? "bg-primary border-primary" : "bg-muted")
              }
            >
              <span
                className={
                  "inline-block h-4 w-4 rounded-full bg-background shadow transform transition " +
                  (profilePublic ? "translate-x-6" : "translate-x-1")
                }
              />
            </button>
          </div>

          {/* Resume Privacy */}
          <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <div>
              <div className="font-medium">Resume Privacy</div>
              <div className="text-xs text-muted-foreground">
                Control who can view your resume.
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleBoolean("resumePublic", resumePublic)}
              className={
                "relative inline-flex h-6 w-12 items-center rounded-full border transition " +
                (resumePublic ? "bg-primary border-primary" : "bg-muted")
              }
            >
              <span
                className={
                  "inline-block h-4 w-4 rounded-full bg-background shadow transform transition " +
                  (resumePublic ? "translate-x-6" : "translate-x-1")
                }
              />
            </button>
          </div>
        </div>
      </section>

      {/* CHANGE PASSWORD */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold">Change Password</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </div>
        </div>
      </section>

      {/* DELETE ACCOUNT */}
      <section className="space-y-2 border-t pt-6">
        <h3 className="text-sm font-semibold text-destructive">
          Delete Your Account
        </h3>
        <p className="text-xs text-muted-foreground max-w-2xl">
          If you delete your account, all your applications, job alerts and
          saved items may be removed permanently. This action cannot be undone.
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center text-sm font-semibold text-destructive hover:underline"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}
