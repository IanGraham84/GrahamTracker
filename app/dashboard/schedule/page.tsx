"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { AgentSchedule } from "@/lib/types";
import { COMMON_TIMEZONES, formatHour12h } from "@/lib/tz";
import { buildHourGrid, slotKey } from "@/lib/scheduleGrid";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const PALETTE = [
  { bg: "bg-primary-light", text: "text-primary-dark" },
  { bg: "bg-sky-light", text: "text-sky" },
  { bg: "bg-warm-light", text: "text-warm" },
  { bg: "bg-stall-light", text: "text-stall" },
  { bg: "bg-hover", text: "text-muted" },
];

type AgentRef = { id: string; name: string };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MasterSchedulePage() {
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [agents, setAgents] = useState<AgentRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTz, setViewTz] = useState("America/New_York");
  const [hiddenAgentIds, setHiddenAgentIds] = useState<Set<string>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<{ dayOfWeek: number; hour: number } | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy names");

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

  const visibleSchedules = useMemo(
    () => schedules.filter((s) => !hiddenAgentIds.has(s.agent_id)),
    [schedules, hiddenAgentIds]
  );

  const { bySlot, minHour, maxHour } = useMemo(
    () => buildHourGrid(visibleSchedules, viewTz),
    [visibleSchedules, viewTz]
  );

  const hours = useMemo(() => {
    const start = minHour === null ? 8 : Math.max(0, minHour - 1);
    const end = maxHour === null ? 20 : Math.min(23, maxHour + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [minHour, maxHour]);

  function toggleAgent(id: string) {
    setHiddenAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectSlot(dayOfWeek: number, hour: number) {
    setSelectedSlot((prev) =>
      prev && prev.dayOfWeek === dayOfWeek && prev.hour === hour ? null : { dayOfWeek, hour }
    );
    setCopyLabel("Copy names");
  }

  const selectedAgentIds = selectedSlot
    ? Array.from(
        new Set((bySlot.get(slotKey(selectedSlot.dayOfWeek, selectedSlot.hour)) ?? []).map((s) => s.agent_id))
      )
    : [];
  const selectedNames = selectedAgentIds
    .map((id) => nameByAgent.get(id) ?? "Unknown agent")
    .sort((a, b) => a.localeCompare(b));

  async function handleCopyNames() {
    await navigator.clipboard.writeText(selectedNames.join("\n"));
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy names"), 1500);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Master schedule</h1>
        <p className="text-sm text-muted mt-1">
          Click any hour to see exactly who committed to working it — use it to cross-check against actual
          attendance.
        </p>
      </div>

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
                    ? "border-line text-faint bg-card"
                    : `border-transparent ${color.bg} ${color.text}`
                }`}
              >
                {a.name}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">View in</span>
          <select
            value={viewTz}
            onChange={(e) => setViewTz(e.target.value)}
            className="rounded-lg border border-line px-2 py-1 text-sm"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSlot && (
        <div className="bg-card rounded-2xl border border-primary/40 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold">
                {DAY_LABELS[selectedSlot.dayOfWeek]} at {formatHour12h(selectedSlot.hour)}
              </p>
              <p className="text-xs text-faint mt-0.5">
                {selectedNames.length} agent{selectedNames.length === 1 ? "" : "s"} committed to this hour
              </p>
            </div>
            {selectedNames.length > 0 && (
              <button
                type="button"
                onClick={handleCopyNames}
                className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:bg-hover shrink-0"
              >
                {copyLabel}
              </button>
            )}
          </div>
          {selectedNames.length === 0 ? (
            <p className="text-sm text-faint mt-3">No one committed to this hour.</p>
          ) : (
            <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedNames.map((name) => (
                <li
                  key={name}
                  className="text-sm bg-hover rounded-lg px-3 py-1.5"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[64px_repeat(7,minmax(88px,1fr))] gap-1 min-w-[700px]">
            <div />
            {DISPLAY_ORDER.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted pb-1">
                {DAY_LABELS[day]}
              </div>
            ))}

            {hours.map((hour) => (
              <Fragment key={hour}>
                <div className="text-xs text-faint text-right pr-2 pt-2">
                  {formatHour12h(hour)}
                </div>
                {DISPLAY_ORDER.map((day) => {
                  const cellSchedules = bySlot.get(slotKey(day, hour)) ?? [];
                  const uniqueIds = Array.from(new Set(cellSchedules.map((s) => s.agent_id)));
                  const isSelected =
                    selectedSlot?.dayOfWeek === day && selectedSlot?.hour === hour;
                  const visible = uniqueIds.slice(0, 3);
                  const overflow = uniqueIds.length - visible.length;

                  return (
                    <button
                      key={`${day}-${hour}`}
                      type="button"
                      onClick={() => selectSlot(day, hour)}
                      className={`min-h-[44px] rounded-lg border p-1 flex flex-wrap content-start gap-1 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary-light"
                          : uniqueIds.length > 0
                          ? "border-line bg-card hover:border-primary/50"
                          : "border-line/40 bg-transparent hover:bg-hover"
                      }`}
                    >
                      {visible.map((id) => {
                        const color = colorByAgent.get(id) ?? PALETTE[0];
                        return (
                          <span
                            key={id}
                            title={nameByAgent.get(id)}
                            className={`w-5 h-5 rounded-full ${color.bg} ${color.text} text-[9px] font-semibold flex items-center justify-center shrink-0`}
                          >
                            {initials(nameByAgent.get(id) ?? "?")}
                          </span>
                        );
                      })}
                      {overflow > 0 && (
                        <span className="text-[9px] text-faint self-center">+{overflow}</span>
                      )}
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
