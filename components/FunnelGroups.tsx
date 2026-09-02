"use client";

import Link from "next/link";
import { AgentFull } from "@/lib/types";
import { computeStage, computeProgress, funnelStagesForType, FunnelStage } from "@/lib/funnel";
import { detectStall } from "@/lib/stall";
import Avatar from "./Avatar";
import StallPill from "./StallPill";
import ProgressBar from "./ProgressBar";

export type SortBy = "funnel" | "date" | "upline";

function AgentRow({ agentFull }: { agentFull: AgentFull }) {
  const stage = computeStage(agentFull);
  const progress = computeProgress(agentFull);
  const stall = detectStall(agentFull);

  return (
    <Link
      href={`/dashboard/${agentFull.agent.id}`}
      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:border-primary/40 transition-colors"
    >
      <Avatar name={agentFull.agent.name} stalled={!!stall} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{agentFull.agent.name}</p>
          {stall && <StallPill label={stall.label} />}
        </div>
        <p className="text-xs text-gray-500 truncate">{stage}</p>
        <div className="mt-1.5 max-w-[220px]">
          <ProgressBar percent={progress} />
        </div>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{progress}%</span>
    </Link>
  );
}

export default function FunnelGroups({
  agents,
  sortBy,
}: {
  agents: AgentFull[];
  sortBy: SortBy;
}) {
  if (agents.length === 0) {
    return <p className="text-sm text-gray-500">No agents yet.</p>;
  }

  if (sortBy === "funnel") {
    const stageOrder: FunnelStage[] = [
      ...funnelStagesForType("licensed"),
      ...funnelStagesForType("unlicensed"),
    ];
    const uniqueStages = Array.from(new Set(stageOrder)).reverse();

    const grouped = new Map<FunnelStage, AgentFull[]>();
    for (const a of agents) {
      const stage = computeStage(a);
      const list = grouped.get(stage) ?? [];
      list.push(a);
      grouped.set(stage, list);
    }

    return (
      <div className="space-y-6">
        {uniqueStages
          .filter((stage) => (grouped.get(stage)?.length ?? 0) > 0)
          .map((stage) => (
            <div key={stage}>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                {stage}{" "}
                <span className="text-gray-400 font-normal">
                  ({grouped.get(stage)!.length})
                </span>
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {grouped.get(stage)!.map((a) => (
                  <AgentRow key={a.agent.id} agentFull={a} />
                ))}
              </div>
            </div>
          ))}
      </div>
    );
  }

  const sorted = [...agents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.agent.created_at).getTime() - new Date(a.agent.created_at).getTime();
    }
    // upline
    return (a.agent.upline ?? "").localeCompare(b.agent.upline ?? "");
  });

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {sorted.map((a) => (
        <AgentRow key={a.agent.id} agentFull={a} />
      ))}
    </div>
  );
}
