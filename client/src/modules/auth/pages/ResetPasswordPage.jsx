import React from "react";
import { useParams } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  const { token } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] flex items-center justify-center p-4">
      <ResetPasswordForm token={token} />
    </div>
  );
}
