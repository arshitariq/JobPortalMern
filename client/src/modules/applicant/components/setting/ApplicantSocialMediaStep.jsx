

import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const platforms = [
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "Youtube" },
  { value: "linkedin", label: "LinkedIn" },
];

export default function ApplicantSocialMediaStep() {
  const { control, register } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  return (
    <div className="space-y-4">
      {fields.map((f, idx) => (
        <div key={f.id} className="grid md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4 space-y-2">
            <Label>Platform</Label>
            <select className="w-full border rounded-md h-10 px-3" {...register(`socialLinks.${idx}.platform`)}>
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-7 space-y-2">
            <Label>Profile link/url</Label>
            <Input placeholder="https://..." {...register(`socialLinks.${idx}.url`)} />
          </div>

          <div className="md:col-span-1">
            <button type="button" className="w-full h-10 border rounded-md" onClick={() => remove(idx)}>
              ✕
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="px-4 py-2 rounded-md border"
        onClick={() => append({ platform: platforms[0].value, url: "" })}
      >
        + Add New Social Link
      </button>
    </div>
  );
}
