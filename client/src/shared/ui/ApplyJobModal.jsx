import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { X, ArrowRight } from "lucide-react";

export default function ApplyJobModal({
  open,
  onOpenChange,
  jobTitle,
  resumeOptions = [],
  selectedResumeId,
  onSelectResume,
  resumeUploadId = "apply-job-resume",
  onResumeUpload,
  isResumeUploading = false,
  coverLetter = "",
  onCoverLetterChange,
  onApply,
  isApplying = false,
}) {
  const activeResume = resumeOptions.find(
    (option) => option.id === selectedResumeId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-base font-semibold">
                  Apply for {jobTitle}
                </DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share your profile and resume with the employer.
            </p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Resume</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select value={selectedResumeId} onValueChange={onSelectResume}>
                  <SelectTrigger className="min-w-[220px]">
                    <SelectValue placeholder="Select resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumeOptions.length === 0 ? (
                      <SelectItem value="no-resume-available" disabled>
                        No resume available
                      </SelectItem>
                    ) : (
                      resumeOptions.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <label
                  htmlFor={resumeUploadId}
                  className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-xs font-medium text-primary transition hover:bg-muted"
                >
                  {isResumeUploading ? "Uploading..." : "Upload new resume"}
                </label>
                <input
                  id={resumeUploadId}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file && onResumeUpload) {
                      onResumeUpload(file);
                    }
                    event.target.value = "";
                  }}
                />
              </div>
              {activeResume?.url && (
                <a
                  href={activeResume.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-green-600 hover:underline"
                >
                  View selected resume
                </a>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cover Letter</Label>
              <Textarea
                value={coverLetter}
                onChange={(e) => onCoverLetterChange?.(e.target.value)}
                placeholder="Tell the employer why you are a great fit."
                className="min-h-[160px] resize-none"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onApply}
              disabled={isApplying}
              className="gap-2"
            >
              {isApplying ? "Applying..." : "Apply Now"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
