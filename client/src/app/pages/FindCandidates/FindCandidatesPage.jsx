import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { toast } from "sonner";

import CandidateProfileModal from "@/shared/ui/CandidateProfileModal";
import { candidatesApi } from "@/modules/candidates/api/candidatesApi";
import { employerApi } from "@/modules/employer/api/employerApi";
import { chatApi } from "@/modules/chat/api/chatApi";
import { env } from "@/shared/config/env";
import { useAppSelector } from "@/app/hooks";

const normalizeImageUrl = (value, fallback = "") => {
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;

  const apiBase = env.API_URL.replace(/\/api$/, "");
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${apiBase}${normalized}`;
};

const formatExperience = (value) => value || "Experience not specified";
const formatLocation = (candidate) => candidate.location || candidate.mapLocation || "Location not specified";

export default function FindCandidatesPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("all");
  const [savedCandidates, setSavedCandidates] = useState(() => new Set());
  const [savingId, setSavingId] = useState(null);
  const [savedCandidatesLoading, setSavedCandidatesLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [chatLoadingByUser, setChatLoadingByUser] = useState({});
  const [chatError, setChatError] = useState("");
  const navigate = useNavigate();
  const authUser = useAppSelector((state) => state.auth.user);
  const isEmployer = authUser?.role === "employer";

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidatesApi.list({ keyword, location, gender });
      if (res?.status === "SUCCESS") {
        setCandidates(Array.isArray(res?.data?.applicants) ? res.data.applicants : []);
      } else {
        setCandidates([]);
        toast.error(res?.message || "Failed to load candidates");
      }
    } catch (err) {
      console.error("Fetch candidates error:", err);
      setCandidates([]);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const loadSavedCandidates = useCallback(async () => {
    try {
      setSavedCandidatesLoading(true);
      const res = await employerApi.savedCandidates();
      if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
        setSavedCandidates(new Set(res.data.map((item) => item.applicantId)));
      }
    } catch (err) {
      console.error("Failed to load saved candidates:", err);
    } finally {
      setSavedCandidatesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedCandidates();
  }, [loadSavedCandidates]);

  useEffect(() => {
    if (!selectedId && candidates.length) {
      const firstId = candidates[0].id || candidates[0]._id;
      setSelectedId(firstId);
    }
  }, [candidates, selectedId]);

  const filtered = useMemo(() => {
    if (!Array.isArray(candidates)) return [];
    const k = keyword.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return candidates.filter((c) => {
      const name = c.fullName || c.name || "";
      const role = c.headline || c.role || "";
      const candidateLocation = formatLocation(c);
      const matchKeyword =
        !k ||
        name.toLowerCase().includes(k) ||
        role.toLowerCase().includes(k) ||
        (Array.isArray(c.skills) &&
          c.skills.some((skill) => skill?.toLowerCase?.().includes(k)));
      const matchLoc = !loc || candidateLocation.toLowerCase().includes(loc);
      const matchGender = gender === "all" ? true : c.gender === gender;
      return matchKeyword && matchLoc && matchGender;
    });
  }, [keyword, location, gender, candidates]);

  const toggleSave = async (id) => {
    if (!id) return;
    const isCurrentlySaved = savedCandidates.has(id);
    setSavingId(id);
    try {
      if (isCurrentlySaved) {
        await employerApi.removeSavedCandidate(id);
        setSavedCandidates((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success("Candidate removed from saved list");
      } else {
        await employerApi.saveCandidate(id);
        setSavedCandidates((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        toast.success("Candidate saved");
      }
    } catch (err) {
      console.error("Failed to update saved candidate:", err);
      toast.error("Unable to update saved candidates");
    } finally {
      setSavingId(null);
    }
  };

  const handleViewProfile = (candidate) => {
    const candidateId = candidate.id || candidate._id;
    setSelectedId(candidateId);
    setSelectedCandidate(candidate);
    setOpenProfile(true);
  };

  const handleMessageCandidate = useCallback(
    async (candidateUserId) => {
      if (!candidateUserId) return;
      setChatError("");
      setChatLoadingByUser((prev) => ({ ...prev, [candidateUserId]: true }));
      try {
        const response = await chatApi.createPrivateChat(candidateUserId);
        if (response?.success && response.data) {
          const chatId = response.data._id || response.data.id;
          navigate(chatId ? `/dashboard/chat/${chatId}` : "/dashboard/chat");
        } else {
          setChatError(response?.message || "Unable to open chat. Please try again.");
        }
      } catch (err) {
        console.error("Failed to open chat:", err);
        setChatError("Unable to open chat. Please try again.");
      } finally {
        setChatLoadingByUser((prev) => ({ ...prev, [candidateUserId]: false }));
      }
    },
    [navigate]
  );

  return (
    <div className="bg-[#c1fbd9] min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {chatError && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-100 p-3 text-sm text-green-800">
            {chatError}
          </div>
        )}

        {/* Header + search */}
        <Card className="border border-green-200 bg-white">
          <CardContent className="p-4 md:p-5">
            <h1 className="text-base font-semibold text-green-900">Find Candidates</h1>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Candidate name, role..."
                  className="pl-9"
                />
              </div>

              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-400" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="pl-9"
                />
              </div>

              <Button
                className="md:px-8 bg-green-500 text-white hover:bg-green-600"
                type="button"
                onClick={fetchCandidates}
              >
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left filters */}
          <div className="space-y-4">
            <Card className="bg-white border border-green-200">
              <CardContent className="p-4">
                <div className="text-sm font-semibold text-green-900">Gender</div>
                <Separator className="my-3 border-green-200" />
                <div className="space-y-2 text-sm text-green-700">
                  {[
                    { key: "all", label: "All" },
                    { key: "male", label: "Male" },
                    { key: "female", label: "Female" },
                    { key: "others", label: "Others" },
                  ].map((g) => (
                    <label key={g.key} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value={g.key}
                        checked={gender === g.key}
                        onChange={() => setGender(g.key)}
                        className="accent-green-500"
                      />
                      <span>{g.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right list */}
          <div className="space-y-4">
            {loading && (
              <Card className="bg-white border border-green-200">
                <CardContent className="p-6 text-sm text-green-700">
                  Loading candidates...
                </CardContent>
              </Card>
            )}

            {!loading && filtered.length === 0 && (
              <Card className="bg-white border border-green-200">
                <CardContent className="p-6 text-center text-green-700">
                  No candidates found. Try different keyword / location.
                </CardContent>
              </Card>
            )}

            {!loading &&
              filtered.map((c) => {
                const candidateId = c.id || c._id;
                const isSelected = selectedId === candidateId;
                const isSaved = savedCandidates.has(candidateId);
                const avatar = normalizeImageUrl(
                  c.avatarUrl,
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    c.fullName || c.name || "Candidate"
                  )}&background=D1FAE5&color=065F46`
                );
                const name = c.fullName || c.name || "Unnamed Candidate";
                const title = c.headline || c.role || "Add headline";

                return (
                  <Card
                    key={candidateId}
                    className={`bg-white transition ${
                      isSelected
                        ? "border-green-500 ring-1 ring-green-200"
                        : "hover:shadow-sm border border-green-200"
                    }`}
                    onClick={() => setSelectedId(candidateId)}
                  >
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={avatar}
                            alt={name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-green-900">{name}</div>
                            <div className="text-xs text-green-700">{title}</div>

                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-green-700">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {formatLocation(c)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5" /> {formatExperience(c.experience)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(candidateId);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-green-300 hover:bg-green-50 disabled:opacity-40"
                            aria-label="Save"
                            disabled={savedCandidatesLoading || savingId === candidateId}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Bookmark className="h-4 w-4 text-green-500" />
                            )}
                          </button>

                          <Button
                            className="gap-2 bg-green-500 text-white hover:bg-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProfile(c);
                            }}
                          >
                            View Profile <ArrowRight className="h-4 w-4" />
                          </Button>

                          {isEmployer && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full sm:w-auto text-green-600 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMessageCandidate(c.userId);
                              }}
                              disabled={!c.userId || Boolean(chatLoadingByUser[c.userId])}
                            >
                              {chatLoadingByUser[c.userId]
                                ? "Opening chat…"
                                : "Message candidate"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>

      {/* Modal */}
      <CandidateProfileModal
        open={openProfile}
        onOpenChange={setOpenProfile}
        candidate={selectedCandidate}
      />
    </div>
  );
}
