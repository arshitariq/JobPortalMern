import React from "react";
import { Outlet } from "react-router-dom";

import ApplicantSidebar from "./ApplicantSidebar";


export default function ApplicantLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      {/* Top bar */}
   

      {/* Sidebar + content */}
      <div className="flex flex-1">
        <ApplicantSidebar />

        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
