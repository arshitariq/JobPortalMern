"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema } from "../validation/authSchemas";
import { authApi } from "../api/authApi";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export default function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values) => {
    try {
      const res = await authApi.forgotPassword(values.email);
      if (res.status === "SUCCESS") toast.success(res.message);
      else toast.error(res.message);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-white shadow-xl border border-[#5eb883]">
        <CardHeader className="text-center text-[#5eb883]">
          <CardTitle className="text-2xl font-semibold">Forgot Password</CardTitle>
          <CardDescription className="text-[#799a87] text-base">
            We will email you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[#5eb883] text-lg">Email</Label>
              <Input
                placeholder="you@example.com"
                {...register("email")}
                className="border-[#5eb883] focus:ring-[#5eb883] text-lg py-3"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <Button
              className="w-full bg-[#5eb883] hover:bg-[#4e9b6e] text-white py-3 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>

            <p className="text-sm text-center text-[#799a87]">
              Back to <Link className="underline text-[#5eb883]" to="/auth/login">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
