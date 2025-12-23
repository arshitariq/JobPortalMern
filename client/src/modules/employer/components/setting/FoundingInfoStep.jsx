import { useFormContext } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const organizationTypes = [
  "Development",
  "Business",
  "Finance & Accounting",
  "IT & Software",
  "Office Productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Photography & Video",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Hospitality",
  "Consulting",
  "Real Estate",
  "Legal",
  "Other",
];

const industryTypes = [
  "Technology",
  "E-commerce",
  "Education",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Manufacturing",
  "Retail",
  "Marketing/Advertising",
  "Hospitality",
  "Other",
];

const teamSizes = ["1-10", "10-50", "50-200", "200-1000"];

export default function FoundingInfoStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const yearValue = watch("yearOfEstablishment");
  const maxDate = new Date().toISOString().split("T")[0];
  const minDate = "1800-01-01";

  const getDateInputValue = (year) => {
    if (!year || Number.isNaN(year)) return "";
    const digits = String(year).padStart(4, "0");
    return `${digits}-01-01`;
  };

  const handleYearChange = (value) => {
    if (!value) {
      setValue("yearOfEstablishment", undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    const digits = Number(value.slice(0, 4));
    setValue("yearOfEstablishment", digits, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Organization Type */}
        <div className="space-y-2">
          <Label>Organization Type</Label>
          <select
            className="w-full border rounded-md h-10 px-3"
            {...register("organizationType")}
          >
            <option value="">Select...</option>
            {organizationTypes.map((t) => (
              <option key={t} value={t.toLowerCase()}>
                {t}
              </option>
            ))}
          </select>
          {errors.organizationType && (
            <p className="text-sm text-destructive">{errors.organizationType.message}</p>
          )}
        </div>

        {/* Industry Type */}
        <div className="space-y-2">
          <Label>Industry Type</Label>
          <select
            className="w-full border rounded-md h-10 px-3"
            {...register("industryType")}
          >
            <option value="">Select...</option>
            {industryTypes.map((t) => (
              <option key={t} value={t.toLowerCase()}>
                {t}
              </option>
            ))}
          </select>
          {errors.industryType && (
            <p className="text-sm text-destructive">{errors.industryType.message}</p>
          )}
        </div>

        {/* Team Size */}
        <div className="space-y-2">
          <Label>Team Size</Label>
          <select
            className="w-full border rounded-md h-10 px-3"
            {...register("teamSize")}
          >
            <option value="">Select...</option>
            {teamSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.teamSize && (
            <p className="text-sm text-destructive">{errors.teamSize.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Year of Establishment (Date Picker) */}
        <div className="space-y-2">
          <Label>Year of Establishment</Label>

          <Input
            type="date"
            min={minDate}
            max={maxDate}
            value={getDateInputValue(yearValue)}
            onChange={(e) => handleYearChange(e.target.value)}
            onFocus={(e) => e.currentTarget.showPicker?.()} // ✅ click/focus pe calendar open
          />

          {errors.yearOfEstablishment && (
            <p className="text-sm text-destructive">{errors.yearOfEstablishment.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Future date select nahi hogi.
          </p>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label>Company Website</Label>
          <Input placeholder="https://example.com" {...register("websiteUrl")} />
          {errors.websiteUrl && (
            <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Company Vision</Label>
        <textarea
          className="w-full min-h-[180px] border rounded-md p-3"
          placeholder="Tell us about your company vision..."
          {...register("companyVision")}
        />
        {errors.companyVision && (
          <p className="text-sm text-destructive">{errors.companyVision.message}</p>
        )}
      </div>
    </div>
  );
}
