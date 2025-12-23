import React, { useCallback, useEffect, useState } from "react";
import { Building2, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { useAppSelector } from "@/app/hooks";
import { employerApi } from "@/modules/employer/api/employerApi";
import { chatApi } from "@/modules/chat/api/chatApi";

const popularSearchTerms = [
  "Product",
  "Engineering",
  "Design",
  "Marketing",
  "Remote",
];

function FeaturedPill() {
  return (
    <span className="rounded-full bg-green-200 px-2 py-0.5 text-[11px] font-medium text-green-800">
      Featured
    </span>
  );
}

function EmployerCard({ item, onMessage, isApplicant, chatLoading }) {
  const letter = (item.name?.[0] || "C").toUpperCase();
  const locationLabel = item.location || "Location not specified";
  const openPositions = item.openPositions ?? 0;
  const openLabel = openPositions === 1 ? "Open Position" : "Open Positions";

  return (
    <Card className="bg-white/80 transition hover:shadow-md backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {item.logoUrl ? (
              <img
                src={item.logoUrl}
                alt={item.name}
                className="h-10 w-10 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-green-500 text-white"
                aria-hidden="true"
              >
                <span className="text-sm font-semibold">{letter}</span>
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                {item.featured && <FeaturedPill />}
              </div>

              <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{locationLabel}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                {item.industry && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5">
                    {item.industry}
                  </span>
                )}
                {item.teamSize && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5">
                    {item.teamSize}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            className="w-full sm:flex-1 justify-center"
            disabled={openPositions === 0}
          >
            {openPositions > 0
              ? `${openLabel} (${openPositions})`
              : "No open positions"}
          </Button>

          {isApplicant && (
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => onMessage?.(item.userId)}
              disabled={!item.userId || chatLoading}
            >
              {chatLoading ? "Opening chat…" : "Message hiring team"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FindEmployersPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [filters, setFilters] = useState({ keyword: "", city: "" });
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0 });
  const [chatLoadingByUser, setChatLoadingByUser] = useState({});
  const authUser = useAppSelector((state) => state.auth.user);
  const isApplicant = authUser?.role === "applicant";
  const navigate = useNavigate();

  const loadEmployers = useCallback(
    async (activeFilters) => {
      try {
        setLoading(true);
        const res = await employerApi.explore({
          q: activeFilters.keyword,
          location: activeFilters.city,
        });
        if (res.status !== "SUCCESS") {
          setEmployers([]);
          setPagination({ total: 0 });
          return;
        }
        setEmployers(res.data?.results || []);
        setPagination(res.data?.pagination || { total: 0 });
      } catch (err) {
        setEmployers([]);
        setPagination({ total: 0 });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEmployers(filters);
  }, [filters, loadEmployers]);

  const totalResults = pagination.total ?? employers.length;

  const handleSearch = (event) => {
    event.preventDefault();
    setFilters({
      keyword: keywordInput,
      city: cityInput,
    });
  };

  const handlePopular = (term) => {
    setKeywordInput(term);
    setFilters((prev) => ({
      ...prev,
      keyword: term,
    }));
  };

  const handleMessageEmployer = useCallback(
    async (employerUserId) => {
      if (!employerUserId) return;
      setChatLoadingByUser((prev) => ({ ...prev, [employerUserId]: true }));
      try {
        const response = await chatApi.createPrivateChat(employerUserId);
        if (response?.success && response.data) {
          const chatId = response.data._id || response.data.id;
          navigate(chatId ? `/dashboard/chat/${chatId}` : "/dashboard/chat");
        }
      } catch (err) {
        // silently ignore errors
      } finally {
        setChatLoadingByUser((prev) => ({
          ...prev,
          [employerUserId]: false,
        }));
      }
    },
    [navigate]
  );

  return (
    <div className="bg-[#c1fbd9] min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Search Row */}
        <div className="rounded-xl border bg-white/80 p-4 md:p-5 backdrop-blur-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Search by: company name, industry..."
                className="pl-9"
              />
            </div>

            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <Input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="City, state or country"
                className="pl-9"
              />
            </div>

            <Button type="submit" className="md:px-6" disabled={loading}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {loading ? "Searching..." : "Find Employers"}
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-700">Popular searches:</span>
            {popularSearchTerms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePopular(p)}
                className="rounded-full border bg-white/70 px-2.5 py-1 text-[11px] text-gray-700 hover:bg-white/90"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mt-6 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-700" />
          <h2 className="text-base font-semibold">Find Employers</h2>
          <span className="text-sm text-gray-700">
            {loading ? "Loading..." : `(${totalResults} results)`}
          </span>
        </div>

        {/* Grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employers.map((item) => (
            <EmployerCard
              key={item.id}
              item={item}
              isApplicant={isApplicant}
              onMessage={handleMessageEmployer}
              chatLoading={Boolean(chatLoadingByUser[item.userId])}
            />
          ))}
        </div>

        {!loading && employers.length === 0 && (
          <div className="mt-10 rounded-xl border bg-white/80 p-6 text-center backdrop-blur-sm">
            <p className="text-sm text-gray-700">
              No employers found. Try different keywords.
            </p>
          </div>
        )}

        {loading && employers.length === 0 && (
          <div className="mt-8 text-center text-sm text-gray-700">
            Loading employers...
          </div>
        )}
      </div>
    </div>
  );
}
