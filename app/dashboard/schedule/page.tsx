"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentSchedule } from "@/lib/types";
import { COMMON_TIMEZONES, convertDayTime, formatTime12h } from "@/lib/tz";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const PALETTE = [
  { bg: "bg-primary-light", text: "text-primary-dark" },
  { bg: "bg-sky-light", text: "text-sky" },
  { bg: "bg-warm-light", text: "text-warm" },
  { bg: "bg-stall-light", text: "text-stall" },
  { bg: "bg-gray-100", text: "text-gray-600" },
];

type AgentRef = { id: string; name: string };

export default function MasterSchedulePage() {
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [agents, setAgents] = useState<AgentRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTz, setViewTz] = useState("America/New_York");
  const [hiddenAgentIds, setHiddenAgentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/schedule", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        setSchedules(body.schedules ?? []);
        setAgents(body.agents ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const colorByAgent = useMemo(() => {
    const map = new Map<string, (typeof PALETTE)[number]>();
    agents.forEach((a, i) => map.set(a.id, PALETTE[i % PALETTE.length]));
    return map;
  }, [agents]);

  const nameByAgent = useMemo(() => {
    const map = new Map<string, string>();
    agents.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [agents]);

  const byDay = useMemo(() => {
    const map = new Map<
      number,
      { schedule: AgentSchedule; start: string; end: string }[]
    >();
    for (const s of schedules) {
      if (hiddenAgentIds.has(s.agent_id)) continue;
      const start = convertDayTime(s.day_of_week, s.start_time.slice(0, 5), s.timezone, viewTz);
      const end = convertDayTime(s.day_of_week, s.end_time.slice(0, 5), s.timezone, viewTz);
      const list = map.get(start.dayOfWeek) ?? [];
      list.push({ schedule: s, start: start.time, end: end.time });
      map.set(start.dayOfWeek, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [schedules, viewTz, hiddenAgentIds]);

  function toggleAgent(id: string) {
    setHiddenAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-xl font-semibold">Master schedule</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {agents.map((a) => {
            const color = colorByAgent.get(a.id)!;
            const hidden = hiddenAgentIds.has(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAgent(a.id)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  hidden
                    ? "border-gray-200 text-gray-300 bg-white"
                    : `border-transparent ${color.bg} ${color.text}`
                }`}
              >
                {a.name}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">View in</span>
          <select
            value={viewTz}
            onChange={(e) => setViewTz(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {DISPLAY_ORDER.map((day) => (
            <div key={day} className="bg-white rounded-xl border border-gray-100 p-2 min-h-[120px]">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">{DAY_LABELS[day]}</p>
              <div className="space-y-1.5">
                {(byDay.get(day) ?? []).map(({ schedule, start, end }) => {
                  const color = colorByAgent.get(schedule.agent_id) ?? PALETTE[0];
                  return (
                    <div
                      key={schedule.id}
                      className={`${color.bg} ${color.text} rounded-lg px-2 py-1 text-xs`}
                    >
                      <p className="font-medium truncate">{nameByAgent.get(schedule.agent_id)}</p>
                      <p>
                        {formatTime12h(start)}–{formatTime12h(end)}
                      </p>
                      {schedule.label && <p className="text-[11px] truncate">{schedule.label}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
