"use client";

import { ReactNode, useState } from "react";

import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#090b0f] text-white">

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* =========================================
          MAIN APPLICATION
      ========================================= */}

      <div className="lg:pl-64">

        {/* HEADER */}

        <DashboardHeader
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        {/* CONTENT */}

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-8">
          {children}
        </main>

      </div>
    </div>
  );
}