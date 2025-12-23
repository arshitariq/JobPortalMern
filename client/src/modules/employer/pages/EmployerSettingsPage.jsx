import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { employerApi } from "@/modules/employer/api/employerApi";
import {
  employerOnboardingSchema,
  defaultEmployerValues,
} from "@/modules/employer/validation/employerSchemas";
import { PHONE_COUNTRIES } from "@/modules/employer/constants/phoneCountries";
import { Button } from "@/shared/ui/button";

import CompanyInfoStep from "@/modules/employer/components/setting/CompanyInfoStep";
import FoundingInfoStep from "@/modules/employer/components/setting/FoundingInfoStep";
import SocialMediaStep from "@/modules/employer/components/setting/SocialMediaStep";
import ContactStep from "@/modules/employer/components/setting/ContactStep";
const PLATFORM_LABELS = {
  facebook: "Facebook",
  twitter: "Twitter",
  instagram: "Instagram",
  youtube: "Youtube",
  linkedin: "LinkedIn",
};

const SETTINGS_STEPS = [
  { key: "company", label: "Company Info", component: CompanyInfoStep },
  { key: "founding", label: "Founding Info", component: FoundingInfoStep },
  { key: "social", label: "Social Media Profile", component: SocialMediaStep },
  { key: "account", label: "Contact", component: ContactStep },
];

const toDisplayPlatform = (value, fallback) => {
  const key = value?.toLowerCase?.();
  if (key && PLATFORM_LABELS[key]) return PLATFORM_LABELS[key];
  if (value) return value;
  return fallback;
};

const normalizeSocialLinksForSave = (list = []) =>
  (Array.isArray(list) ? list : []).map((link, index) => {
    const value = link?.platform || "";
    const key = value.toLowerCase();
    const normalized = PLATFORM_LABELS[key] ? key : value.toLowerCase() || "facebook";
    return {
      platform: normalized,
      url: link?.url || "",
      isPublic: typeof link?.isPublic === "boolean" ? link.isPublic : true,
    };
  });

const buildFormValues = (data = {}) => {
  const merged = {
    ...defaultEmployerValues,
    ...data,
  };

  merged.socialLinks =
    Array.isArray(data.socialLinks) && data.socialLinks.length
      ? data.socialLinks.map((link, index) => ({
          platform: toDisplayPlatform(
            link?.platform,
            defaultEmployerValues.socialLinks[index]?.platform || "Facebook"
          ),
          url: link?.url || "",
        }))
      : defaultEmployerValues.socialLinks.map((link) => ({ ...link }));

  if (typeof merged.yearOfEstablishment !== "number" || Number.isNaN(merged.yearOfEstablishment)) {
    merged.yearOfEstablishment = defaultEmployerValues.yearOfEstablishment;
  }

  if (data.phone) {
    const match = PHONE_COUNTRIES.find((country) => data.phone.startsWith(country.code));
    if (match) {
      merged.phoneCountry = match.key;
      merged.phoneNumber = data.phone.slice(match.code.length);
    } else {
      merged.phoneCountry = defaultEmployerValues.phoneCountry;
      merged.phoneNumber = "";
    }
  } else {
    merged.phoneCountry = defaultEmployerValues.phoneCountry;
    merged.phoneNumber = "";
  }

  merged.phone = data.phone || "";

  return merged;
};

export default function EmployerSettingsPage() {
  const methods = useForm({
    resolver: zodResolver(employerOnboardingSchema),
    defaultValues: defaultEmployerValues,
    mode: "onTouched",
    shouldUnregister: false,
  });

  const { handleSubmit, reset } = methods;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await employerApi.me();
        if (res.status !== "SUCCESS") {
          toast.error(res.message || "Failed to load profile");
          return;
        }
        reset(buildFormValues(res.data || {}));
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      setSaving(true);
      const payload = {
        ...values,
        socialLinks: normalizeSocialLinksForSave(values.socialLinks),
      };

      const res = await employerApi.updateOnboarding(payload);
      if (res.status !== "SUCCESS") {
        toast.error(res.message || "Update failed");
        return;
      }
      toast.success(res.message || "Settings updated");
      reset(buildFormValues(res.data || values));
    } catch (error) {
      toast.error("Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = SETTINGS_STEPS.length;
  const progress = Math.round((((currentStep + 1) / totalSteps) * 100));
  const StepComponent =
    SETTINGS_STEPS[currentStep]?.component || SETTINGS_STEPS[0].component;

  const goToStep = (index) => {
    setCurrentStep(Math.min(Math.max(index, 0), totalSteps - 1));
  };

  const handleNextStep = () => goToStep(currentStep + 1);
  const handlePrevStep = () => goToStep(currentStep - 1);

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your company profile information.
          </p>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
            <div className="border-b bg-muted/30 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                {SETTINGS_STEPS.map((step, idx) => {
                  const isActive = idx === currentStep;
                  const isCompleted = idx < currentStep;
                  return (
                    <button
                      type="button"
                      key={step.key}
                      onClick={() => goToStep(idx)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : isCompleted
                          ? "border-primary/40 bg-primary/5 text-primary/70"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-semibold">
                        {idx + 1}
                      </span>
                      {step.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span>{progress}% complete</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="p-5">
              <StepComponent />
            </div>

            <div className="flex flex-col gap-3 border-t bg-muted/20 px-5 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <p>Review each section and save once everything looks good.</p>
              <div className="flex flex-wrap gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                  >
                    Previous
                  </Button>
                )}

                {currentStep < totalSteps - 1 ? (
                  <Button type="button" onClick={handleNextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
