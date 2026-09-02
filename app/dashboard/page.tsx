"use client";

import { useEffect, useState } from "react";
import { useAgents } from "@/lib/AgentsContext";
import { AgentFull } from "@/lib/types";
import { computeStage } from "@/lib/funnel";
import MetricsRow from "@/components/MetricsRow";
import StallBanner from "@/components/StallBanner";
import FunnelGroups, { SortBy } from "@/components/FunnelGroups";
import { toCsv, downloadCsv } from "@/lib/csv";

function matchesSearch(agentFull: AgentFull, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const name = agentFull.agent.name?.toLowerCase() ?? "";
  const state = agentFull.agent.state?.toLowerCase() ?? "";
  if (name.includes(needle) || state.includes(needle)) return true;

  const needleDigits = needle.replace(/\D/g, "");
  if (needleDigits) {
    const phoneDigits = (agentFull.agent.phone ?? "").replace(/\D/g, "");
    if (phoneDigits.includes(needleDigits)) return true;
  }

  return false;
}

export default function DashboardPage() {
  const { agents, loading } = useAgents();
  const [sortBy, setSortBy] = useState<SortBy>("funnel");
  const [showArchived, setShowArchived] = useState(false);
  const [archivedAgents, setArchivedAgents] = useState<AgentFull[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [search, setSearch] = useState("");

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
  const filteredAgents = displayedAgents.filter((a) => matchesSearch(a, search));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:bg-hover"
        >
          Export CSV
        </button>
      </div>

      {!showArchived && <MetricsRow agents={agents} />}
      {!showArchived && <StallBanner agents={agents} />}

      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, state, or phone…"
          className="w-full rounded-lg border border-line bg-card pl-9 pr-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-line px-2 py-1.5 text-sm"
          >
            <option value="funnel">Funnel stage</option>
            <option value="date">Date added</option>
            <option value="upline">Upline</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
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
        <p className="text-sm text-faint">Loading…</p>
      ) : search.trim() && filteredAgents.length === 0 ? (
        <p className="text-sm text-faint">No agents match &ldquo;{search.trim()}&rdquo;.</p>
      ) : (
        <FunnelGroups agents={filteredAgents} sortBy={sortBy} />
      )}
    </div>
  );
}
