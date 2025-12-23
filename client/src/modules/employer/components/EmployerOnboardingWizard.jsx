import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { employerOnboardingSchema, defaultEmployerValues } from "../validation/employerSchemas";
import { PHONE_COUNTRIES } from "../constants/phoneCountries";
import { employerApi } from "../api/employerApi";

import CompanyInfoStep from "./setting/CompanyInfoStep";
import FoundingInfoStep from "./setting/FoundingInfoStep";
import SocialMediaStep from "./setting/SocialMediaStep";
import ContactStep from "./setting/ContactStep";
import CompletedStep from "./setting/CompletedStep";

const steps = [
  { key: "company", label: "Company Info" },
  { key: "founding", label: "Founding Info" },
  { key: "social", label: "Social Media Profile" },
  { key: "contact", label: "Contact" },
];

// Functions to handle social links & phone
const PLATFORM_LABELS = { facebook: "Facebook", twitter: "Twitter", instagram: "Instagram", youtube: "Youtube", linkedin: "LinkedIn" };
const buildWizardValues = (data = {}) => {
  const merged = { ...defaultEmployerValues, ...data };
  merged.socialLinks = Array.isArray(data.socialLinks) && data.socialLinks.length
    ? data.socialLinks.map((link, index) => {
        const key = link?.platform?.toLowerCase?.() || "";
        const fallback = defaultEmployerValues.socialLinks[index]?.platform || "Facebook";
        return { platform: PLATFORM_LABELS[key] || link?.platform || fallback, url: link?.url || "" };
      })
    : defaultEmployerValues.socialLinks.map((link) => ({ ...link }));

  const phoneValue = typeof data.phone === "string" ? data.phone : "";
  if (phoneValue) {
    const match = PHONE_COUNTRIES.find((c) => phoneValue.startsWith(c.code));
    if (match) {
      merged.phoneCountry = match.key;
      merged.phoneNumber = phoneValue.slice(match.code.length);
    } else {
      merged.phoneCountry = defaultEmployerValues.phoneCountry;
      merged.phoneNumber = phoneValue.replace(/^\+/, "");
    }
  } else {
    merged.phoneCountry = defaultEmployerValues.phoneCountry;
    merged.phoneNumber = "";
  }
  merged.phone = phoneValue;
  return merged;
};
const normalizeSocialLinksForSave = (list = []) =>
  (Array.isArray(list) ? list : []).map((link = {}) => ({ platform: (link.platform || "facebook").toLowerCase(), url: link.url || "" }));

export default function EmployerOnboardingWizard() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  const methods = useForm({
    resolver: zodResolver(employerOnboardingSchema),
    defaultValues: defaultEmployerValues,
    mode: "onTouched",
    shouldUnregister: false,
  });

  const { handleSubmit, reset, getValues } = methods;
  const progress = useMemo(() => Math.round(((active + 1) / (steps.length + 1)) * 100), [active]);

  useEffect(() => {
    (async () => {
      const res = await employerApi.me();
      setLoading(false);
      if (res.status === "SUCCESS") reset(buildWizardValues(res.data || {}));
    })();
  }, [reset]);

  const saveCurrentStep = async () => {
    const v = getValues();
    const payloadByStep = {
      company: { companyName: v.companyName, about: v.about, logoUrl: v.logoUrl, bannerUrl: v.bannerUrl },
      founding: { organizationType: v.organizationType, industryType: v.industryType, teamSize: v.teamSize, yearOfEstablishment: v.yearOfEstablishment, websiteUrl: v.websiteUrl, companyVision: v.companyVision },
      social: { socialLinks: normalizeSocialLinksForSave(v.socialLinks) },
      contact: { mapLocation: v.mapLocation, phone: v.phone, contactEmail: v.contactEmail },
    };
    const stepKey = steps[active]?.key;
    const payload = payloadByStep[stepKey] || {};
    const res = await employerApi.updateOnboarding(payload);
    if (res.status === "SUCCESS") toast.success(res.message || "Saved");
    else toast.error(res.message || "Save failed");
    return res;
  };

  const onNext = async () => {
    const res = await saveCurrentStep();
    if (res?.status === "SUCCESS") {
      if (active < steps.length - 1) setActive((p) => p + 1);
      else setActive(steps.length);
    }
  };
  const onPrev = () => setActive((p) => Math.max(0, p - 1));
  const onFinish = async () => {
    const res = await saveCurrentStep();
    if (res?.status === "SUCCESS") {
      toast.success("Profile 100% complete!");
      setActive(steps.length);
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between border-b border-white/30">
          <div className="flex gap-6">
            {steps.map((s, idx) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActive(idx)}
                className={`py-3 text-sm font-medium ${
                  idx === active ? "text-white border-b-2 border-white" : "text-white/70"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 py-3 text-white/90 text-xs">
            <span>Setup Progress</span>
            <span className="font-medium">{active >= steps.length ? 100 : progress}% Completed</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(() => {})} className="space-y-6">
          {active === 0 && <CompanyInfoStep />}
          {active === 1 && <FoundingInfoStep />}
          {active === 2 && <SocialMediaStep />}
          {active === 3 && <ContactStep />}
          {active === steps.length && (
            <CompletedStep
              onDashboard={() => navigate("/employer", { replace: true })}
              onPostJob={() => navigate("/employer/post-job", { replace: true })}
            />
          )}

          {active < steps.length && (
            <div className="flex items-center gap-3">
              {active > 0 && (
                <button type="button" className="px-4 py-2 rounded-md border text-white" onClick={onPrev}>
                  Previous
                </button>
              )}

              {active < steps.length - 1 ? (
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-white text-[#5eb883] hover:bg-white/90"
                  onClick={onNext}
                >
                  Save & Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-white text-[#5eb883] hover:bg-white/90"
                  onClick={onFinish}
                >
                  Finish →
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </FormProvider>
  );
}
