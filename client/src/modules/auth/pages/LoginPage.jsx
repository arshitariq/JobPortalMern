import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const { user, loading } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "employer" ? "/employer" : "/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
