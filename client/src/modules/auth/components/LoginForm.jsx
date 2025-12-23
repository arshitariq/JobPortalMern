"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validation/authSchemas";
import { useAppDispatch } from "@/app/hooks";
import { loginThunk } from "../store/authSlice";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Eye, EyeOff, Lock, Mail, UserCheck } from "lucide-react";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const res = await dispatch(loginThunk(data));

    if (loginThunk.fulfilled.match(res)) {
      toast.success("Login successful");
      const user = res.payload;
      navigate(user?.role === "employer" ? "/employer" : "/dashboard", { replace: true });
    } else {
      toast.error(res.payload || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border border-[#5eb883]">
        <CardHeader className="text-center text-[#5eb883]">
          <div className="mx-auto w-16 h-16 bg-[#5eb883] rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-[#5eb883]">Login</CardTitle>
          <CardDescription className="text-[#799a87]">Sign in to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#5eb883]">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#799a87]" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className="pl-10 border-[#5eb883] focus:ring-[#5eb883]"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#5eb883]">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#799a87]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  {...register("password")}
                  className="pl-10 pr-10 border-[#5eb883] focus:ring-[#5eb883]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-[#5eb883]" /> : <Eye className="w-4 h-4 text-[#5eb883]" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}

              <div className="text-right">
                <Link to="/auth/forgot-password" className="text-sm text-[#5eb883] underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#5eb883] hover:bg-[#4e9b6e] text-white" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-sm text-center text-[#799a87]">
              Don’t have an account?{" "}
              <Link to="/auth/register" className="text-[#5eb883] underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
