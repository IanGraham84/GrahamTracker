"use client";

import Link from "next/link";
import { AgentFull } from "@/lib/types";
import { detectStall } from "@/lib/stall";

export default function StallBanner({ agents }: { agents: AgentFull[] }) {
  const stalled = agents
    .filter((a) => !a.agent.archived_at)
    .map((a) => ({ agentFull: a, stall: detectStall(a) }))
    .filter((x): x is { agentFull: AgentFull; stall: { label: string } } => !!x.stall);

  if (stalled.length === 0) return null;

  return (
    <div className="rounded-2xl border border-stall/30 bg-stall-light p-4">
      <p className="text-sm font-semibold text-stall mb-2">
        {stalled.length} agent{stalled.length === 1 ? "" : "s"} may be stalled
      </p>
      <ul className="space-y-1">
        {stalled.map(({ agentFull, stall }) => (
          <li key={agentFull.agent.id} className="text-sm">
            <Link
              href={`/dashboard/${agentFull.agent.id}`}
              className="font-medium text-stall hover:underline"
            >
              {agentFull.agent.name}
            </Link>
            <span className="text-stall/80"> — {stall.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
