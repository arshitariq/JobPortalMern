import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  const { user, loading } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (user.role === "employer") navigate("/employer/onboarding", { replace: true });
    else navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
