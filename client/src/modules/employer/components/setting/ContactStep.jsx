import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PHONE_COUNTRIES } from "../../constants/phoneCountries";

export default function ContactStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const phoneCountry = watch("phoneCountry");
  const phoneNumber = watch("phoneNumber");

  const selected = useMemo(
    () => PHONE_COUNTRIES.find((c) => c.key === phoneCountry),
    [phoneCountry]
  );

  // ✅ build final phone for backend: +92xxxxxxxxxx
  useEffect(() => {
    const digitsOnly = (phoneNumber || "").replace(/\D/g, "");
    const full = selected?.code && digitsOnly ? `${selected.code}${digitsOnly}` : "";
    setValue("phone", full, { shouldValidate: true, shouldDirty: true });
  }, [phoneNumber, selected, setValue]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Map Location</Label>
        <Input placeholder="Map Location" {...register("mapLocation")} />
        {errors.mapLocation && (
          <p className="text-sm text-destructive">{errors.mapLocation.message}</p>
        )}
      </div>

      {/* ✅ Country + Phone */}
      <div className="space-y-2">
        <Label>Country</Label>
        <select
          className="w-full border rounded-md h-10 px-3"
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
          <p className="text-sm text-destructive">{errors.phoneCountry.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <div className="flex gap-2">
          <Input value={selected?.code || ""} disabled className="w-28" />
          <Input
            placeholder="Digits only"
            inputMode="numeric"
            {...register("phoneNumber")}
          />
        </div>

        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
        )}

        {/* hidden field -> backend ko yahi jayega */}
        <input type="hidden" {...register("phone")} />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input placeholder="Email address..." {...register("contactEmail")} />
        {errors.contactEmail && (
          <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
        )}
      </div>
    </div>
  );
}
