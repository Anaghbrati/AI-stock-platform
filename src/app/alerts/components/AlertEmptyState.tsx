"use client";

import { Bell, Plus } from "lucide-react";

interface AlertEmptyStateProps {
  onCreate: () => void;
}

export default function AlertEmptyState({
  onCreate,
}: AlertEmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Bell className="h-7 w-7 text-muted-foreground" />
      </div>

      <h2 className="mb-2 text-lg font-semibold">
        No alerts yet
      </h2>

      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Create a stock alert to get notified when a
        price or percentage-change condition is reached.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Create Alert
      </button>
    </div>
  );
}