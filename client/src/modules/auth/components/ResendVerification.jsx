"use client";
import React, { useState } from "react";
import { authApi } from "../api/authApi";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onResend = async () => {
    setLoading(true);
    const res = await authApi.resendVerification(email);
    setLoading(false);

    if (res.status === "SUCCESS") toast.success(res.message);
    else toast.error(res.message);
  };

  return (
    <div className="space-y-2 p-4 rounded-md shadow-md max-w-lg mx-auto">
      <Label className="text-[#5eb883] font-semibold">Resend verification email</Label>
      <div className="flex gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border-[#5eb883] focus:ring-[#5eb883]"
        />
        <Button
          type="button"
          onClick={onResend}
          disabled={loading}
          className="bg-[#5eb883] hover:bg-[#4e9b6e] text-white"
        >
          {loading ? "Sending..." : "Resend"}
        </Button>
      </div>
    </div>
  );
}
