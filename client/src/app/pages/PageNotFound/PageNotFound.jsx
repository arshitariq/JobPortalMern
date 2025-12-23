import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold">
          404
        </div>

        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sorry, the page you are looking for doesn’t exist or has been moved.
        </p>

        <div className="mt-3 rounded-xl border bg-background p-3 text-left">
          <p className="text-xs text-muted-foreground">Requested URL:</p>
          <p className="break-all text-sm font-medium">
            {location.pathname}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            ← Go Back
          </button>

          <Link
            to="/"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Go Home
          </Link>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          If you think this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
}
