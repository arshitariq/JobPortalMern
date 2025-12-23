// src/modules/applicant/components/setting/ApplicantProfileStep.jsx
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { TiptapEditor } from "@/shared/editor/tiptap";

// simple example options – you can extend these
const NATIONALITY_OPTIONS = ["Pakistan", "India", "Bangladesh", "Other"];

const EDUCATION_OPTIONS = [
  { label: "High school", value: "high school" },
  { label: "Undergraduate", value: "undergraduate" },
  { label: "Masters", value: "masters" },
  { label: "PhD", value: "phd" },
];

const EXPERIENCE_OPTIONS = [
  "No experience",
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5+ years",
];

export default function ApplicantProfileStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const bioValue = watch("biography") ?? "";

  return (
    <div className="space-y-6">
      {/* --- top grid like screenshot --- */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Row 1: nationality + dob */}
        <div className="space-y-2">
          <Label>Nationality</Label>
          <select
            className="h-10 w-full rounded-md border px-3 text-sm"
            {...register("nationality")}
          >
            <option value="">Select…</option>
            {NATIONALITY_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {errors.nationality && (
            <p className="text-xs text-destructive">
              {errors.nationality.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input
            type="date"
            placeholder="Date of Birth"
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-destructive">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        {/* Row 2: gender + marital status */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <select
            className="h-10 w-full rounded-md border px-3 text-sm"
            {...register("gender")}
          >
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-destructive">
              {errors.gender.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Marital Status</Label>
          <select
            className="h-10 w-full rounded-md border px-3 text-sm"
            {...register("maritalStatus")}
          >
            <option value="">Select…</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          {errors.maritalStatus && (
            <p className="text-xs text-destructive">
              {errors.maritalStatus.message}
            </p>
          )}
        </div>

        {/* Row 3: education + experience */}
        <div className="space-y-2">
          <Label>Education</Label>
          <select
            className="h-10 w-full rounded-md border px-3 text-sm"
            {...register("education")}
          >
            <option value="">Select…</option>
            {EDUCATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.education && (
            <p className="text-xs text-destructive">
              {errors.education.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Experience</Label>
          <select
            className="h-10 w-full rounded-md border px-3 text-sm"
            {...register("experience")}
          >
            <option value="">Select…</option>
            {EXPERIENCE_OPTIONS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          {errors.experience && (
            <p className="text-xs text-destructive">
              {errors.experience.message}
            </p>
          )}
        </div>
      </div>

      {/* Interests / biography editor */}
      <div className="space-y-2">
        <Label>Interests</Label>
        <TiptapEditor
          content={bioValue}
          onChange={(html) =>
            setValue("biography", html, {
              shouldDirty: true,
              shouldTouch: true,
            })
          }
        />
        {errors.biography && (
          <p className="text-xs text-destructive">
            {errors.biography.message}
          </p>
        )}
      </div>

      {/* Skills list (optional – keep or remove as per design) */}
      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="e.g. React, Figma"
                {...register(`skills.${index}`)}
              />
              <button
                type="button"
                className="h-9 w-9 rounded-md border text-xs"
                onClick={() => remove(index)}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm"
            onClick={() => append("")}
          >
            + Add skill
          </button>
        </div>
      </div>
    </div>
  );
}
