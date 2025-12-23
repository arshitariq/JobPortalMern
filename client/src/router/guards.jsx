import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function RoleRoute({ allow = [], children }) {
  const { user, loading } = useAppSelector((s) => s.auth);

  if (loading) return null;
  if (!user) return <Navigate to="/auth/login" replace />;

  if (!allow.includes(user.role)) {
    // if employer tries applicant route -> send dashboard
    if (user.role === "employer") return <Navigate to="/employer" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
