// src/shared/ui/Navbar/Navbar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { 
  Briefcase, 
  User, 
  LogOut, 
  ChevronDown, 
  Bell, 
  MessageCircle,
  Menu,
  X,
  Building,
  Home,
  Users,
  HelpCircle,
  Settings,
  Search
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { applicantApi } from "@/modules/applicant/api/applicantApi";
import { employerApi } from "@/modules/employer/api/employerApi";
import { logoutThunk } from "@/modules/auth/store/authSlice";

export default function Navbar() {
  const { user, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState("");
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const isEmployer = user?.role === 'employer';
  const [profileInfo, setProfileInfo] = useState(null);
  const profileDisplayName =
    profileInfo?.fullName || user?.name || user?.fullName || "User";
  const profileEmail = profileInfo?.contactEmail || user?.email || "";
  const profileAvatar =
    profileInfo?.avatarUrl ||
    profileInfo?.logoUrl ||
    user?.avatar;

  const getLinks = () => [
    { to: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
    { to: "/jobs", label: "Find Job", icon: <Briefcase className="h-4 w-4" /> },
    { to: "/find-employers", label: "Companies", icon: <Building className="h-4 w-4" /> },
    { to: "/find-candidates", label: "Candidates", icon: <Users className="h-4 w-4" /> },
    { to: "/customer-support", label: "Support", icon: <HelpCircle className="h-4 w-4" /> },
  ];

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/");
    setIsProfileDropdownOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return "/auth/login";
    return isEmployer ? "/employer" : "/dashboard";
  };

  useEffect(() => {
    if (!user) {
      setProfileInfo(null);
      return;
    }
    let isCancelled = false;
    const fetchProfile = async () => {
      try {
        if (user.role === "applicant") {
          const { status, data } = await applicantApi.getProfile();
          if (!isCancelled && status === "SUCCESS") setProfileInfo(data);
        } else if (user.role === "employer") {
          const { status, data } = await employerApi.me();
          if (!isCancelled && status === "SUCCESS") setProfileInfo(data);
        }
      } catch (error) {
        console.error("Failed to load profile info", error);
      }
    };
    fetchProfile();
    return () => { isCancelled = true; };
  }, [user]);

  const baseLink = "flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#2f4f3c] hover:text-white hover:bg-[#3e6b54] rounded-md transition-all";
  const activeLink = "bg-[#3e6b54] text-white";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) setIsProfileDropdownOpen(false);
      if (isChatDropdownOpen && !event.target.closest('.chat-dropdown')) setIsChatDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen, isChatDropdownOpen]);

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-[#c1fbd9] shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="animate-pulse h-8 w-32 bg-[#5eb883] rounded"></div>
            <div className="animate-pulse h-8 w-24 bg-[#5eb883] rounded"></div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#c1fbd9] shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-[#3e6b54]" />
              <span className="text-xl font-bold text-[#1f3728]">SkillLink</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <ul className="flex items-center space-x-1">
              {getLinks().map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `${baseLink} ${isActive ? activeLink : ""}`
                    }
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-[#2f4f3c] hover:text-white hover:bg-[#3e6b54] rounded-full transition-all">
                  <Bell className="h-5 w-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 rounded-full p-1 hover:bg-[#5eb883] transition-all"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#5eb883] flex items-center justify-center overflow-hidden">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt={profileDisplayName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-white">
                          {profileDisplayName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-[#1f3728]">
                      {profileDisplayName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[#1f3728]" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#c1fbd9] shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <Link
                        to={getDashboardPath()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#1f3728] hover:bg-[#5eb883] hover:text-white rounded-md"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-[#5eb883] hover:text-white rounded-md mt-1"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-[#1f3728] hover:text-white hover:bg-[#3e6b54] rounded-lg transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#3e6b54] rounded-lg hover:bg-[#2f4f3c] transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md p-2 text-[#1f3728] hover:bg-[#5eb883] md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#5eb883]">
            <div className="space-y-1 pb-3 pt-2">
              {getLinks().map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md ${
                      isActive ? "bg-[#3e6b54] text-white" : "text-[#2f4f3c] hover:text-white hover:bg-[#3e6b54]"
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
