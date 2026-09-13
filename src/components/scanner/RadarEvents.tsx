import type { SectorScannerEvents } from "../../lib/scanner/scanner.types";

interface RadarEventsProps {
  events: SectorScannerEvents;
}

export default function RadarEvents({
  events,
}: RadarEventsProps) {
  if (events.totalEvents === 0) {
    return (
      <section className="rounded-2xl border border-white/[0.06] bg-[#11151F]/75 p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03]">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-100">
              Radar Events
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Quantitative signals detected during the scan.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-[#07090E]/60 px-4 py-4">
          <p className="text-sm text-slate-500">
            No significant radar events were detected in this scan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#11151F]/75 p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>

            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-red-400/80">
              Live Detection
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
            Radar Events
          </h2>

          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Quantitative signals detected during the scan.
          </p>
        </div>

        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.05] px-4 py-2.5 text-right">
          <p className="text-lg font-semibold leading-none text-red-400">
            {events.totalEvents}
          </p>

          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-red-400/50">
            Events
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-red-500/10 bg-red-500/[0.035] px-3 py-2.5">
          <p className="text-sm font-semibold text-red-400">
            {events.highSeverityEvents}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
            High
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.025] px-3 py-2.5">
          <p className="text-sm font-semibold text-amber-400">
            {events.mediumSeverityEvents}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
            Medium
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
          <p className="text-sm font-semibold text-slate-400">
            {events.lowSeverityEvents}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
            Low
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {events.events.map((event, index) => {
          const severityStyles =
            event.severity === "high"
              ? {
                  border: "border-red-500/15",
                  background: "bg-red-500/[0.035]",
                  dot: "bg-red-400",
                  ticker: "text-red-300",
                  badge: "border-red-500/15 bg-red-500/10 text-red-400",
                }
              : event.severity === "medium"
                ? {
                    border: "border-amber-500/10",
                    background: "bg-amber-500/[0.02]",
                    dot: "bg-amber-400",
                    ticker: "text-amber-300",
                    badge:
                      "border-amber-500/15 bg-amber-500/10 text-amber-400",
                  }
                : {
                    border: "border-white/[0.06]",
                    background: "bg-white/[0.015]",
                    dot: "bg-slate-500",
                    ticker: "text-slate-300",
                    badge:
                      "border-white/[0.06] bg-white/[0.03] text-slate-500",
                  };

          return (
            <div
              key={`${event.ticker}-${event.type}-${index}`}
              className={`rounded-xl border ${severityStyles.border} ${severityStyles.background} p-4 transition-colors duration-200 hover:border-white/[0.1]`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${severityStyles.dot}`}
                    />

                    <span
                      className={`text-sm font-semibold ${severityStyles.ticker}`}
                    >
                      {event.ticker.replace(".NS", "")}
                    </span>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${severityStyles.badge}`}
                    >
                      {event.severity}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-sm font-medium text-slate-200">
                    {event.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {event.description}
                  </p>
                </div>

                {event.value !== null && (
                  <div className="shrink-0 rounded-lg border border-white/[0.05] bg-[#07090E]/50 px-3 py-2 text-right">
                    <p className="text-sm font-semibold text-slate-200">
                      {event.value.toFixed(2)}
                      {event.unit ?? ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}