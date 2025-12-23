"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validation/authSchemas";
import { useAppDispatch } from "@/app/hooks";
import { registerThunk } from "../store/authSlice";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Eye, EyeOff, Lock, Mail, User, UserCheck } from "lucide-react";

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "applicant" },
  });

  const onSubmit = async (data) => {
    const res = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(res)) {
      toast.success("Registered successfully (check email for verification)");
      const user = res.payload;
      if (user?.role === "employer") navigate("/employer/onboarding", { replace: true });
      else navigate("/dashboard", { replace: true });
    } else {
      toast.error(res.payload || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-xl bg-white shadow-2xl border border-[#5eb883] rounded-2xl">
        <CardHeader className="text-center text-[#5eb883] py-6">
          <div className="mx-auto w-20 h-20 bg-[#5eb883] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <UserCheck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#5eb883]">Register</CardTitle>
          <CardDescription className="text-[#799a87] text-base">Create your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-[#5eb883] font-medium">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#799a87]" />
                <Input
                  placeholder="Your name"
                  autoComplete="name"
                  {...register("name")}
                  className="pl-12 py-3 border-[#5eb883] focus:ring-[#5eb883] rounded-xl"
                />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label className="text-[#5eb883] font-medium">Username *</Label>
              <Input
                placeholder="username"
                autoComplete="username"
                {...register("userName")}
                className="pl-3 py-3 border-[#5eb883] focus:ring-[#5eb883] rounded-xl"
              />
              {errors.userName && <p className="text-sm text-destructive">{errors.userName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-[#5eb883] font-medium">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#799a87]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email")}
                  className="pl-12 py-3 border-[#5eb883] focus:ring-[#5eb883] rounded-xl"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-[#5eb883] font-medium">Role *</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-[#5eb883] focus:ring-[#5eb883] rounded-xl py-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applicant">Applicant</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-[#5eb883] font-medium">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#799a87]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Password"
                  {...register("password")}
                  className="pl-12 pr-12 py-3 border-[#5eb883] focus:ring-[#5eb883] rounded-xl"
                />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-[#5eb883]" /> : <Eye className="w-5 h-5 text-[#5eb883]" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-[#5eb883] font-medium">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#799a87]" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  {...register("confirmPassword")}
                  className="pl-12 pr-12 py-3 border-[#5eb883] focus:ring-[#5eb883] rounded-xl"
                />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5 text-[#5eb883]" /> : <Eye className="w-5 h-5 text-[#5eb883]" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <Button className="w-full bg-[#5eb883] hover:bg-[#4e9b6e] text-white py-3 text-lg rounded-xl" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create account"}
            </Button>

            {/* Login link */}
            <p className="text-sm text-center text-[#799a87]">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-[#5eb883] underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
