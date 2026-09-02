"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import { AgentFull, AgentSchedule } from "@/lib/types";
import { computeStage } from "@/lib/funnel";
import { AGENCY } from "@/lib/agency";
import ProgressSummary from "@/components/ProgressSummary";
import Checklist from "@/components/Checklist";
import WeeklySchedule from "@/components/WeeklySchedule";

export default function AgentSelfServicePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [agentFull, setAgentFull] = useState<AgentFull | null>(null);
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const [agentRes, scheduleRes] = await Promise.all([
      fetch(`/api/agent/${token}`, { cache: "no-store" }),
      fetch(`/api/agent/${token}/schedule`, { cache: "no-store" }),
    ]);
    if (agentRes.ok) {
      setAgentFull(await agentRes.json());
    } else {
      setNotFound(true);
    }
    if (scheduleRes.ok) {
      const body = await scheduleRes.json();
      setSchedules(body.schedules ?? []);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    load();
  }, [load]);

  async function toggleStep(stepId: string, checked: boolean) {
    const res = await fetch(`/api/agent/${token}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, checked }),
    });
    if (res.ok && checked) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 }, colors: AGENCY.confettiColors });
    }
    load();
  }

  async function handleAddSchedule(input: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    label: string | null;
    timezone: string;
  }) {
    await fetch(`/api/agent/${token}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    load();
  }

  async function handleDeleteSchedule(scheduleId: string) {
    await fetch(`/api/agent/${token}/schedule?scheduleId=${scheduleId}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return <p className="text-sm text-faint p-8">Loading…</p>;
  }
  if (notFound || !agentFull) {
    return <p className="text-sm text-faint p-8">We couldn&apos;t find that checklist.</p>;
  }

  const stage = computeStage(agentFull);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-1">
        <div className="flex justify-center mb-2">
          <Image src="/graham-agency-logo.webp" alt={AGENCY.name} width={96} height={96} priority />
        </div>
        <h1 className="text-2xl font-semibold">Welcome, {agentFull.agent.name.split(" ")[0]}!</h1>
        <p className="text-sm text-muted">{stage}</p>
      </div>

      <ProgressSummary agentFull={agentFull} title="Your progress" />

      <div className="bg-card rounded-2xl border border-line p-4">
        <p className="text-sm font-semibold mb-3">Your checklist</p>
        <Checklist key={agentFull.agent.id} agentFull={agentFull} admin={false} onToggle={toggleStep} />
      </div>

      <div className="bg-card rounded-2xl border border-line p-4">
        <p className="text-sm font-semibold mb-3">Your weekly schedule</p>
        <WeeklySchedule
          schedules={schedules}
          onAdd={handleAddSchedule}
          onDelete={handleDeleteSchedule}
        />
      </div>
    </div>
  );
}
