"use client";

import { AgentFull } from "@/lib/types";
import { computeStage } from "@/lib/funnel";

const CONTRACTING_STAGES = new Set([
  "AML / SureLC / E&O in progress",
  "Ready for contracts",
  "Contracts sent",
  "Licensed — starting contracting",
]);

export default function MetricsRow({ agents }: { agents: AgentFull[] }) {
  const active = agents.filter((a) => !a.agent.archived_at);
  const stages = active.map((a) => computeStage(a));

  const total = active.length;
  const started = stages.filter((s) => s !== "Not started").length;
  const contracting = stages.filter((s) => CONTRACTING_STAGES.has(s)).length;
  const wroteFirstBusiness = stages.filter((s) => s === "Wrote first business").length;
  const stillActive = total - wroteFirstBusiness;

  const tiles = [
    { label: "Total agents", value: total },
    { label: "Started", value: started },
    { label: "In contracting", value: contracting },
    { label: "Active pipeline", value: stillActive },
    { label: "Wrote first business", value: wroteFirstBusiness },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="bg-card rounded-2xl border border-line p-4">
          <p className="text-2xl font-semibold text-foreground">{tile.value}</p>
          <p className="text-xs text-muted mt-1">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
