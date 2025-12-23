// src/modules/employer/pages/EmployerPostJobPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { employerApi } from "@/modules/employer/api/employerApi";
import { toast } from "sonner";

import { JobForm } from "../components/JobForm";
import JobPromoteModal from "../components/AddJobPromoteModal";

export default function EmployerPostJobPage() {
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    tags: "",
    jobRole: "",
    minSalary: "",
    maxSalary: "",
    salaryCurrency: "USD",
    salaryType: "",
    education: "",
    experience: "",
    jobType: "",
    vacancies: "",
    expirationDate: "",
    jobLevel: "",
    country: "",
    city: "",
    isRemote: false,
    benefits: [],
    description: "",
    applyMode: "on_jobpilot",
    externalUrl: "",
    applyEmail: "",
  });

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [createdJobTitle, setCreatedJobTitle] = useState("");

  // Load existing job in edit mode
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        const res = await employerApi.getJob(jobId);
        if (res.status === "SUCCESS" && res.data) {
          const j = res.data;
          setForm({
            title: j.title || "",
            tags: (j.tags || []).join(", "),
            jobRole: j.jobRole || "",
            minSalary: j.minSalary || "",
            maxSalary: j.maxSalary || "",
            salaryCurrency: j.salaryCurrency || "USD",
            salaryType: j.salaryType || "",
            education: j.educationLevel || j.education || "",
            experience: j.experienceLevel || j.experience || "",
            jobType: j.employmentType || j.jobType || "",
            vacancies: j.vacancies || "",
            expirationDate:
              j.applicationDeadline || j.expirationDate
                ? (j.applicationDeadline || j.expirationDate).slice(0, 10)
                : "",
            jobLevel: j.jobLevel || "",
            country: j.address?.country || j.country || "",
            city: j.address?.city || j.city || "",
            isRemote: j.workLocationType === "Remote" || !!j.isRemote,
            benefits: j.benefits?.map((b) => b.name || b) || [],
            description: j.description || "",
            applyMode:
              j.applicationProcess === "Easy Apply"
                ? "on_jobpilot"
                : j.applicationProcess === "Company Website"
                ? "external_url"
                : j.applicationProcess === "Email"
                ? "email"
                : j.applyMode || "on_jobpilot",
            externalUrl: j.applicationUrl || j.externalUrl || "",
            applyEmail: j.applicationEmail || j.applyEmail || "",
          });
        } else {
          toast.error(res.message || "Failed to load job");
        }
      } catch (e) {
        console.error(e);
        toast.error("Something went wrong while loading job");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, jobId]);

  const handleChange = (eOrObj) => {
    const target = eOrObj.target || eOrObj;
    const { name, value, type, checked } = target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleToggleBenefit = (tag) => {
    setForm((prev) => {
      const exists = prev.benefits.includes(tag);
      return {
        ...prev,
        benefits: exists
          ? prev.benefits.filter((b) => b !== tag)
          : [...prev.benefits, tag],
      };
    });
  };

  const handleApplyModeChange = (mode) => {
    setForm((prev) => ({ ...prev, applyMode: mode }));
  };

  // Updated handleSubmit - accepts payload from JobForm

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      let res;
      if (isEdit) {
        res = await employerApi.updateJob(jobId, payload);
      } else {
        res = await employerApi.createJob(payload);
      }

      if (res.status === "SUCCESS") {
        toast.success(
          isEdit ? "Job updated successfully" : "Job created successfully"
        );

        if (isEdit) {
          navigate("/employer/jobs");
        } else {
          const titleFromApi = res.data?.title || payload.title;
          setCreatedJobTitle(titleFromApi);
          setShowPromoteModal(true);
        }
      } else {
        toast.error(res.message || "Failed to save job");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted rounded-md animate-pulse" />
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {isEdit ? "Edit job" : "Post a job"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Add job details so candidates can find the right role.
            </p>
          </div>
        </div>

        <JobForm
          form={form}
          isEdit={isEdit}
          saving={saving}
          onChange={handleChange}
          onToggleBenefit={handleToggleBenefit}
          onApplyModeChange={handleApplyModeChange}
          onSubmit={handleSubmit}
        />
      </div>

      <JobPromoteModal
        open={showPromoteModal}
        jobTitle={createdJobTitle}
        onClose={() => setShowPromoteModal(false)}
        onViewJobs={() => {
          setShowPromoteModal(false);
          navigate("/employer/jobs");
        }}
      />
    </>
  );
}
