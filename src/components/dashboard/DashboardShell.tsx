"use client";

import {
  ReactNode,
  useState,
} from "react";

import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#090b0f] text-white">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="lg:pl-64">

        <DashboardHeader
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>

      </div>

    </div>
  );
}