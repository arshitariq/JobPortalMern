import React, { useState } from "react";

export default function JobPromoteModal({
  open,
  jobTitle,
  onClose,
  onViewJobs,
}) {
  const [selected, setSelected] = useState("featured"); // 'featured' | 'highlight'

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] shadow-xl">
        {/* header row */}
        <div className="flex items-start justify-between border-b border-white/30 px-5 py-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              🎉 Congratulations, your job is successfully posted!
            </p>
            <p className="text-xs text-white/70">
              You can manage your job from the My Jobs section in your
              dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xl text-white hover:bg-white/20"
          >
            ×
          </button>
        </div>

        {/* view jobs button */}
        <div className="border-b border-white/30 px-5 py-3">
          <button
            type="button"
            onClick={onViewJobs}
            className="inline-flex items-center rounded-md border border-white/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
          >
            View Jobs
          </button>
        </div>

        {/* body */}
        <div className="space-y-4 px-5 py-4 text-white">
          <div>
            <h3 className="text-sm font-semibold">
              Promote Job: {jobTitle || "Your Job"}
            </h3>
            <p className="mt-1 text-xs text-white/70">
              Fusce commodo, sem non tempor consequat, sapien turpis blandit
              turpis, non pharetra nisi velit pulvinar lectus. Suspendisse varius
              at nisi vel pulvinar.
            </p>
          </div>

          {/* cards */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* featured card */}
            <button
              type="button"
              onClick={() => setSelected("featured")}
              className={`flex h-full flex-col rounded-xl border p-4 text-left text-xs transition ${
                selected === "featured"
                  ? "border-white bg-white/20"
                  : "border-white/30 bg-white/10 hover:bg-white/20"
              }`}
            >
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-white/70">
                <span>ALWAYS ON THE TOP</span>
                <span
                  className={`h-3 w-3 rounded-full border ${
                    selected === "featured" ? "bg-white border-white" : ""
                  }`}
                />
              </div>

              <div className="mb-3 h-16 rounded-md bg-white/20">
                <div className="h-4 w-24 rounded-sm bg-white/50" />
                <div className="mt-2 h-2 w-32 rounded-sm bg-white/30" />
                <div className="mt-1 h-2 w-28 rounded-sm bg-white/30" />
              </div>

              <div className="mt-auto space-y-1">
                <div className="text-sm font-semibold text-white">Featured Your Job</div>
                <p className="text-[11px] text-white/70">
                  Sed neque diam, lacinia nec dolor et, euismod bibendum turpis.
                  Sed feugiat fauc.
                </p>
              </div>
            </button>

            {/* highlight card */}
            <button
              type="button"
              onClick={() => setSelected("highlight")}
              className={`flex h-full flex-col rounded-xl border p-4 text-left text-xs transition ${
                selected === "highlight"
                  ? "border-white bg-white/20"
                  : "border-white/30 bg-white/10 hover:bg-white/20"
              }`}
            >
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-white/70">
                <span>HIGHLIGHT JOB WITH COLOR</span>
                <span
                  className={`h-3 w-3 rounded-full border ${
                    selected === "highlight" ? "bg-white border-white" : ""
                  }`}
                />
              </div>

              <div className="mb-3 h-16 rounded-md bg-white/20">
                <div className="h-4 w-24 rounded-sm bg-white/50" />
                <div className="mt-2 h-2 w-32 rounded-sm bg-white/30" />
                <div className="mt-1 h-2 w-28 rounded-sm bg-white/30" />
              </div>

              <div className="mt-auto space-y-1">
                <div className="text-sm font-semibold text-white">Highlight Your Job</div>
                <p className="text-[11px] text-white/70">
                  Sed neque diam, lacinia nec dolor et, euismod bibendum turpis.
                  Sed feugiat fauc.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-white/30 px-5 py-3 text-xs text-white">
          <button
            type="button"
            onClick={onViewJobs}
            className="hover:underline"
          >
            Skip now
          </button>

          <button
            type="button"
            onClick={onViewJobs}
            className="inline-flex items-center rounded-md bg-white/30 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/50"
          >
            Promote Job
          </button>
        </div>
      </div>
    </div>
  );
}
