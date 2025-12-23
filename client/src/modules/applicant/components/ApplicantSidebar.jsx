// src/modules/applicant/components/ApplicantSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Heart, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  MessageCircle 
} from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { useAppDispatch } from "@/app/hooks";
import { logoutThunk } from "@/modules/auth/store/authSlice";

const base = "/dashboard";

const nav = [
  { label: "Overview",      icon: LayoutDashboard, to: base },
  { label: "Profile",       icon: User,            to: `${base}/profile` },
  { label: "Applied Jobs",  icon: Briefcase,       to: `${base}/applied-jobs` },
  { label: "Favorite Jobs", icon: Heart,           to: `${base}/favorite-jobs` },
  { label: "Chat",          icon: MessageCircle,   to: `${base}/chat` },
  { label: "Job Alert",     icon: Bell,            to: `${base}/job-alerts` },
  { label: "Settings",      icon: Settings,        to: `${base}/settings` },
];

export default function ApplicantSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/auth/login", { replace: true });
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Top label */}
      <div className="p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Candidate Dashboard
        </h2>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === base}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout bottom */}
      <div className="border-t p-3">
        <Button
          type="button"
          variant="ghost"
          className="flex w-full items-center justify-start gap-3"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}