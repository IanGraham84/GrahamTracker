"use client";

import { useEffect, useState } from "react";
import { useAgents } from "@/lib/AgentsContext";
import { AgentFull } from "@/lib/types";
import { computeStage } from "@/lib/funnel";
import MetricsRow from "@/components/MetricsRow";
import StallBanner from "@/components/StallBanner";
import FunnelGroups, { SortBy } from "@/components/FunnelGroups";
import { toCsv, downloadCsv } from "@/lib/csv";

export default function DashboardPage() {
  const { agents, loading } = useAgents();
  const [sortBy, setSortBy] = useState<SortBy>("funnel");
  const [showArchived, setShowArchived] = useState(false);
  const [archivedAgents, setArchivedAgents] = useState<AgentFull[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);

  useEffect(() => {
    if (!showArchived) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- entering loading state for the fetch this effect starts
    setArchivedLoading(true);
    fetch("/api/admin/agents?include_archived=true", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        const all: AgentFull[] = body.agents ?? [];
        setArchivedAgents(all.filter((a) => a.agent.archived_at));
      })
      .finally(() => !cancelled && setArchivedLoading(false));
    return () => {
      cancelled = true;
    };
  }, [showArchived]);

  async function handleExportCsv() {
    const res = await fetch("/api/admin/agents?include_archived=true", { cache: "no-store" });
    const body = await res.json();
    const all: AgentFull[] = body.agents ?? [];

    const rows: string[][] = [
      ["Name", "Phone", "Email", "State", "Upline", "Type", "Stage", "Start date", "Archived"],
      ...all.map((a) => [
        a.agent.name,
        a.agent.phone ?? "",
        a.agent.email ?? "",
        a.agent.state ?? "",
        a.agent.upline ?? "",
        a.agent.type,
        computeStage(a),
        a.agent.start_date,
        a.agent.archived_at ? "yes" : "no",
      ]),
    ];

    downloadCsv(`agents-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  }

  const displayedAgents = showArchived ? archivedAgents : agents;
  const isLoading = showArchived ? archivedLoading : loading;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      {!showArchived && <MetricsRow agents={agents} />}
      {!showArchived && <StallBanner agents={agents} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            <option value="funnel">Funnel stage</option>
            <option value="date">Date added</option>
            <option value="upline">Upline</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-[var(--color-primary)]"
          />
          Show archived
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <FunnelGroups agents={displayedAgents} sortBy={sortBy} />
      )}
    </div>
  );
}
