import React from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/shared/ui/button";

export default function ApplicantCompletedStep({ onDashboard, onEdit }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-xl font-semibold">All steps finished</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          Your applicant profile now mirrors the employer flow. You can head back to the dashboard
          or jump in to edit again at any time.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={onDashboard}>
          Go to dashboard
        </Button>
        <Button type="button" variant="outline" onClick={onEdit}>
          Edit information again
        </Button>
      </div>
    </div>
  );
}
