// src/app/routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute, RoleRoute } from "@/router/guards";

// ---------- AUTH ----------
import LoginPage from "@/modules/auth/pages/LoginPage";
import RegisterPage from "@/modules/auth/pages/RegisterPage";
import ForgotPasswordPage from "@/modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/modules/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "@/modules/auth/pages/VerifyEmailPage";

// ---------- DASHBOARD LAYOUTS ----------
import ApplicantLayout from "@/modules/applicant/components/ApplicantLayout";
import ApplicantDashboardPage from "@/modules/applicant/pages/ApplicantDashboardPage";
import ApplicantAppliedJobsPage from "@/modules/applicant/pages/ApplicantAppliedJobsPage";
import ApplicantFavoriteJobsPage from "@/modules/applicant/pages/ApplicantFavoriteJobsPage";
import ApplicantJobAlertsPage from "@/modules/applicant/pages/ApplicantJobAlertsPage";
import ApplicantSettingsPage from "@/modules/applicant/pages/ApplicantSettingsPage"
import ApplicantProfilePage from "@/modules/applicant/pages/ApplicantProfilePage";

import EmployerLayout from '..//modules/employer/components/EmployerLayout';
import EmployerDashboardPage from "@/modules/employer/pages/EmployerDashboardPage";
import EmployerSettingsPage from "@/modules/employer/pages/EmployerSettingsPage";
import EmployerProfilePage from "@/modules/employer/pages/EmployerProfilePage";
import EmployerPostJobPage from "@/modules/employer/pages/EmployerPostJobPage";
import EmployerMyJobsPage from "@/modules/employer/pages/EmployerMyJobsPage";
import EmployerSavedCandidatesPage from "@/modules/employer/pages/EmployerSavedCandidatesPage";
import EmployerOnboardingPage from "@/modules/employer/pages/EmployerOnboardingPage";
import EmployerJobApplicationsPage from "@/modules/employer/pages/EmployerJobApplicationsPage";

// ---------- PUBLIC PAGES ----------
import HomePage from "./pages/Home/HomePage";
import FindJobPage from "./pages/FindJob/FindJobPage";
import JobDetailsPage from "./pages/FindJob/JobDetailsPage";
import FindEmployersPage from "./pages/FindEmployers/FindEmployersPage";
import FindCandidatesPage from "./pages/FindCandidates/FindCandidatesPage";
import JobAlertsPage from "./pages/JobAlerts/JobAlertsPage";
import CustomerSupportPage from "./pages/CustomerSupports/CustomerSupports";
import PageNotFound from "./pages/PageNotFound/PageNotFound";

// Import ChatPage component
const ChatPage = React.lazy(() => import('./pages/Chat/ChatPage'));

function ChatLayout() {
  return (
    <div className="p-6">
      <React.Suspense fallback={<div>Loading chats…</div>}>
        <ChatPage />
      </React.Suspense>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<FindJobPage />} />
      <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
      <Route path="/find-employers" element={<FindEmployersPage />} />
      <Route path="/find-candidates" element={<FindCandidatesPage />} />
      <Route path="/job-alerts" element={<JobAlertsPage />} />
      <Route path="/customer-support" element={<CustomerSupportPage />} />

      {/* ---------- AUTH ROUTES ---------- */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

      {/* ---------- APPLICANT DASHBOARD ---------- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["applicant"]}>
              <ApplicantLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<ApplicantDashboardPage />} />
        <Route path="profile" element={<ApplicantProfilePage />} />
        <Route path="applied-jobs" element={<ApplicantAppliedJobsPage />} />
        <Route path="favorite-jobs" element={<ApplicantFavoriteJobsPage />} />
        <Route path="chat" element={<ChatLayout />} />
        <Route path="chat/:chatId" element={<ChatLayout />} />
        <Route path="job-alerts" element={<ApplicantJobAlertsPage />} />
        <Route path="settings" element={<ApplicantSettingsPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* ---------- EMPLOYER DASHBOARD ---------- */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["employer"]}>
              <EmployerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployerDashboardPage />} />
        <Route path="onboarding" element={<EmployerOnboardingPage />} />
        <Route path="profile" element={<EmployerProfilePage />} />
        
        {/* Jobs */}
        <Route path="post-job" element={<EmployerPostJobPage />} />
        <Route path="jobs" element={<EmployerMyJobsPage />} />
        <Route path="jobs/:jobId/edit" element={<EmployerPostJobPage />} />
        <Route path="jobs/:jobId/applications" element={<EmployerJobApplicationsPage />} />
        
        {/* Chat - For employers */}
        <Route path="chat" element={<ChatLayout />} />
        <Route path="chat/:chatId" element={<ChatLayout />} />
        
        {/* Other employer pages */}
        <Route path="saved-candidates" element={<EmployerSavedCandidatesPage />} />
        <Route path="settings" element={<EmployerSettingsPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
