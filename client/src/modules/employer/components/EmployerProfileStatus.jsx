import React from "react";
import { useAppSelector } from "@/app/hooks";
import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";

export default function EmployerProfileStatus() {
  const details = useAppSelector((s) => s.employer.details);
  const navigate = useNavigate();

  if (!details) return null;

  const isProfileCompleted =
    details?.name &&
    details?.description &&
    details?.organizationType &&
    details?.yearOfEstablishment;

  if (isProfileCompleted) return null;

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] text-white flex items-center justify-between shadow-md">
      <div>
        <h3 className="font-semibold text-white">Incomplete Profile</h3>
        <p className="text-white/80 text-sm">
          Please complete your employer profile to unlock all features.
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={() => navigate("/employer/settings")}
        className="bg-white text-[#5eb883] hover:bg-white/90"
      >
        Complete Profile
      </Button>
    </div>
  );
}
