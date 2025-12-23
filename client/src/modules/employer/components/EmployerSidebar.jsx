// src/modules/employer/components/EmployerSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { useAppDispatch } from "@/app/hooks";
import { logoutThunk } from "@/modules/auth/store/authSlice";
import {
  LayoutDashboard,
  User,
  Plus,
  Briefcase,
  Bookmark,
  CreditCard,
  Building,
  Settings,
  LogOut,
  MessageCircle
} from "lucide-react";

const base = "/employer";

const nav = [
  { name: "Overview", icon: LayoutDashboard, to: base },
  { name: "Employers Profile", icon: User, to: `${base}/profile` },
  { name: "Post a Job", icon: Plus, to: `${base}/post-job` },
  { name: "My Jobs", icon: Briefcase, to: `${base}/jobs` },
  { name: "Chat", icon: MessageCircle, to: `${base}/chat` },
  { name: "Saved Candidate", icon: Bookmark, to: `${base}/saved-candidates` },
  

  { name: "Settings", icon: Settings, to: `${base}/settings` },
];

export default function EmployerSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/auth/login", { replace: true });
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Top label */}
      <div className="p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Employer Dashboard
        </h2>
      </div>

      {/* Nav items */}
      <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === base}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout bottom */}
      <div className="p-3 border-t">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </aside>
  );
}
