"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AgentFull, AgentSchedule } from "@/lib/types";
import { computeStage, FunnelStage, STAGE_ADVANCE_STEPS } from "@/lib/funnel";
import { detectStall } from "@/lib/stall";
import { createClient } from "@/lib/supabaseClient";
import { useAgents } from "@/lib/AgentsContext";
import Avatar from "@/components/Avatar";
import StallPill from "@/components/StallPill";
import ProgressSummary from "@/components/ProgressSummary";
import Pipeline from "@/components/Pipeline";
import Checklist from "@/components/Checklist";
import WeeklySchedule from "@/components/WeeklySchedule";
import EditAgentModal from "@/components/EditAgentModal";

export default function AgentDetailPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const router = useRouter();
  const { refetch: refetchAgents } = useAgents();

  const [agentFull, setAgentFull] = useState<AgentFull | null>(null);
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [notes, setNotes] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [origin, setOrigin] = useState("");

  const load = useCallback(async () => {
    const [agentsRes, schedulesRes] = await Promise.all([
      fetch("/api/admin/agents?include_archived=true", { cache: "no-store" }),
      fetch(`/api/admin/agents/${agentId}/schedule`, { cache: "no-store" }),
    ]);
    if (agentsRes.ok) {
      const body = await agentsRes.json();
      const found: AgentFull | undefined = (body.agents ?? []).find(
        (a: AgentFull) => a.agent.id === agentId
      );
      if (found) {
        setAgentFull(found);
        setNotes(found.agent.notes ?? "");
      } else {
        setNotFound(true);
      }
    }
    if (schedulesRes.ok) {
      const body = await schedulesRes.json();
      setSchedules(body.schedules ?? []);
    }
    setLoading(false);
  }, [agentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    load();
    setOrigin(window.location.origin);

    const supabase = createClient();
    const channel = supabase
      .channel(`agent-${agentId}-realtime`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_checks", filter: `agent_id=eq.${agentId}` },
        load
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_dates", filter: `agent_id=eq.${agentId}` },
        load
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_schedules", filter: `agent_id=eq.${agentId}` },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, load]);

  async function toggleStep(stepId: string, checked: boolean) {
    if (!agentFull) return;
    setAgentFull({
      ...agentFull,
      checks: {
        ...agentFull.checks,
        [stepId]: { checked, checked_at: checked ? new Date().toISOString() : null, checked_by: checked ? "admin" : null },
      },
    });
    await fetch(`/api/admin/agents/${agentId}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, checked }),
    });
    load();
  }

  async function handleStageClick(stage: FunnelStage) {
    const stepIds = STAGE_ADVANCE_STEPS[stage];
    if (!stepIds) return;
    await Promise.all(
      stepIds.map((stepId) =>
        fetch(`/api/admin/agents/${agentId}/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepId, checked: true }),
        })
      )
    );
    load();
  }

  async function handleContractsSentToggle(sent: boolean) {
    await fetch(`/api/admin/agents/${agentId}/contracts-sent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sent }),
    });
    load();
  }

  async function handleNotesBlur() {
    await fetch(`/api/admin/agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  async function handleExamDate(date: string) {
    await fetch(`/api/admin/agents/${agentId}/exam-date`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examDate: date || null }),
    });
    load();
  }

  async function handleSnooze(date: string) {
    await fetch(`/api/admin/agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stall_snoozed_until: date || null }),
    });
    load();
  }

  async function handleArchiveToggle() {
    if (!agentFull) return;
    const archiving = !agentFull.agent.archived_at;
    await fetch(`/api/admin/agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived_at: archiving ? new Date().toISOString() : null }),
    });
    load();
    refetchAgents();
  }

  async function handleRemove() {
    if (!confirm("Remove this agent permanently? This cannot be undone.")) return;
    await fetch(`/api/admin/agents/${agentId}`, { method: "DELETE" });
    refetchAgents();
    router.push("/dashboard");
  }

  async function handleCopyLink() {
    if (!agentFull) return;
    await navigator.clipboard.writeText(`${origin}/agent/${agentFull.agent.unique_token}`);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy"), 1500);
  }

  async function handleAddSchedule(input: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    label: string | null;
    timezone: string;
  }) {
    await fetch(`/api/admin/agents/${agentId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    load();
  }

  async function handleDeleteSchedule(scheduleId: string) {
    await fetch(`/api/admin/agents/${agentId}/schedule?scheduleId=${scheduleId}`, {
      method: "DELETE",
    });
    load();
  }

  if (loading) return <p className="text-sm text-faint">Loading…</p>;
  if (notFound || !agentFull) return <p className="text-sm text-faint">Agent not found.</p>;

  const stage = computeStage(agentFull);
  const stall = detectStall(agentFull);
  const { agent } = agentFull;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={agent.name} stalled={!!stall} size="lg" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold">{agent.name}</h1>
              {agent.archived_at && (
                <span className="text-xs font-medium bg-hover text-muted rounded-full px-2 py-0.5">
                  Archived
                </span>
              )}
            </div>
            <p className="text-sm text-muted">{stage}</p>
            {stall && (
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <StallPill label={stall.label} />
                <label className="flex items-center gap-1 text-[11px] text-faint">
                  Snooze until
                  <input
                    type="date"
                    value={agent.stall_snoozed_until ?? ""}
                    onChange={(e) => handleSnooze(e.target.value)}
                    className="rounded-md border border-line bg-card px-1.5 py-0.5 text-xs text-foreground"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:bg-hover"
          >
            Edit agent
          </button>
          <button
            type="button"
            onClick={handleArchiveToggle}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:bg-hover"
          >
            {agent.archived_at ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg border border-stall/30 px-3 py-1.5 text-sm text-stall hover:bg-stall-light"
          >
            Remove
          </button>
        </div>
      </div>

      <ProgressSummary agentFull={agentFull} title="Progress" />

      <div className="bg-card rounded-2xl border border-line p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-faint">Type</p>
          <p className="capitalize">{agent.type}</p>
        </div>
        <div>
          <p className="text-xs text-faint">Upline</p>
          <p>{agent.upline || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-faint">Start date</p>
          <p>{agent.start_date}</p>
        </div>
        <div>
          <p className="text-xs text-faint">Phone</p>
          <p>{agent.phone || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-faint">Email</p>
          <p>{agent.email || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-faint">State</p>
          <p>{agent.state || "—"}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-line p-4">
        <p className="text-xs font-medium text-muted mb-1.5">Shareable link</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={agentFull ? `${origin}/agent/${agent.unique_token}` : ""}
            className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm bg-hover text-muted"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:bg-hover shrink-0"
          >
            {copyLabel}
          </button>
        </div>
      </div>

      {agent.type === "unlicensed" && (
        <div className="bg-card rounded-2xl border border-line p-4">
          <p className="text-xs font-medium text-muted mb-2">Exam date</p>
          <input
            type="date"
            value={agentFull.dates.exam_date ?? ""}
            onChange={(e) => handleExamDate(e.target.value)}
            className="rounded-lg border border-line px-3 py-1.5 text-sm"
          />
        </div>
      )}

      <div className="bg-card rounded-2xl border border-line p-4">
        <p className="text-xs font-medium text-muted mb-2">Internal notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          rows={4}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          placeholder="Notes visible to admins only…"
        />
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-2">Pipeline</p>
        <Pipeline agentFull={agentFull} onStageClick={handleStageClick} />
      </div>

      <div className="bg-admin border border-admin-border/40 rounded-2xl p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-warm">
          <input
            type="checkbox"
            checked={!!agentFull.dates.contracts_sent_at}
            onChange={(e) => handleContractsSentToggle(e.target.checked)}
            className="accent-[var(--color-warm)]"
          />
          Contracts sent
        </label>
        {agentFull.dates.contracts_sent_at && (
          <p className="text-xs text-warm/70 mt-1">
            Sent {new Date(agentFull.dates.contracts_sent_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-line p-4">
        <p className="text-sm font-semibold mb-3">Checklist</p>
        <Checklist key={agentFull.agent.id} agentFull={agentFull} admin onToggle={toggleStep} />
      </div>

      <div className="bg-card rounded-2xl border border-line p-4">
        <p className="text-sm font-semibold mb-3">Weekly schedule</p>
        <WeeklySchedule
          schedules={schedules}
          onAdd={handleAddSchedule}
          onDelete={handleDeleteSchedule}
        />
      </div>

      {showEdit && (
        <EditAgentModal
          agent={agent}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            load();
            refetchAgents();
          }}
        />
      )}
    </div>
  );
}
