import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    (async () => {
      const res = await authApi.verifyEmail(token);
      if (res.status === "SUCCESS") toast.success(res.message);
      else toast.error(res.message);

      setDone(true);
      navigate("/auth/login", { replace: true });
    })();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] flex items-center justify-center p-4">
      <p className="text-white font-medium">
        {done ? "Verified. Redirecting..." : "Verifying email..."}
      </p>
    </div>
  );
}
