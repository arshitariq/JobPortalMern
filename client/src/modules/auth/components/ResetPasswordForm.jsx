"use client";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetSchema } from "../validation/authSchemas";
import { authApi } from "../api/authApi";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export default function ResetPasswordForm({ token }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values) => {
    const res = await authApi.resetPassword({ token, ...values });
    if (res.status === "SUCCESS") {
      toast.success(res.message);
      navigate("/auth/login", { replace: true });
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#5eb883]">Reset Password</CardTitle>
          <CardDescription className="text-[#5eb883]/80">Set your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#5eb883] font-semibold">New Password</Label>
              <Input
                type="password"
                {...register("password")}
                className="border-[#5eb883] focus:ring-[#5eb883]"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[#5eb883] font-semibold">Confirm Password</Label>
              <Input
                type="password"
                {...register("confirmPassword")}
                className="border-[#5eb883] focus:ring-[#5eb883]"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              className="w-full bg-[#5eb883] hover:bg-[#4e9b6e] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>

            <p className="text-sm text-center text-[#5eb883]/90">
              Back to <Link className="underline" to="/auth/login">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
