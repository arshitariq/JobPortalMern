import React from "react";
import { useAppSelector } from "@/app/hooks";
import EmployerStats from "../components/EmployerStats";
import EmployerProfileStatus from "../components/EmployerProfileStatus";

export default function EmployerDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Hello, <span className="capitalize">{user?.name?.toLowerCase()}</span>
        </h1>
        <p className="text-muted-foreground">Here is your daily activities</p>
      </div>

      <EmployerStats />
      <EmployerProfileStatus />
    </div>
  );
}
