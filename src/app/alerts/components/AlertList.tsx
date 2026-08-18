"use client";

import type { Alert } from "../../../types/alert";

import AlertCard from "./AlertCard";

interface AlertListProps {
  alerts: Alert[];
  onDeleted: (alertId: string) => void;
}

export default function AlertList({
  alerts,
  onDeleted,
}: AlertListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}