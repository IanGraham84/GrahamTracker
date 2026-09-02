"use client";

import { useMemo, useState } from "react";
import { AgentSchedule } from "@/lib/types";
import { COMMON_TIMEZONES, convertDayTime, formatTime12h } from "@/lib/tz";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

type NewBlock = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string;
  timezone: string;
};

export default function WeeklySchedule({
  schedules,
  onAdd,
  onDelete,
}: {
  schedules: AgentSchedule[];
  onAdd: (input: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    label: string | null;
    timezone: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [viewTz, setViewTz] = useState(schedules[0]?.timezone ?? "America/New_York");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewBlock>({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "10:00",
    label: "",
    timezone: viewTz,
  });

  const byDay = useMemo(() => {
    const map = new Map<number, { schedule: AgentSchedule; start: string; end: string }[]>();
    for (const s of schedules) {
      const start = convertDayTime(s.day_of_week, s.start_time.slice(0, 5), s.timezone, viewTz);
      const end = convertDayTime(s.day_of_week, s.end_time.slice(0, 5), s.timezone, viewTz);
      const list = map.get(start.dayOfWeek) ?? [];
      list.push({ schedule: s, start: start.time, end: end.time });
      map.set(start.dayOfWeek, list);
    }
    return map;
  }, [schedules, viewTz]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onAdd({
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        label: form.label.trim() || null,
        timezone: form.timezone,
      });
      setAdding(false);
      setForm((f) => ({ ...f, label: "" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
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
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="text-sm font-medium text-primary hover:underline"
        >
          {adding ? "Cancel" : "+ Add block"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-primary-light/40 rounded-xl p-3"
        >
          <select
            value={form.day_of_week}
            onChange={(e) => setForm((f) => ({ ...f, day_of_week: Number(e.target.value) }))}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            {DISPLAY_ORDER.map((d) => (
              <option key={d} value={d}>
                {DAY_LABELS[d]}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          />
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          />
          <input
            placeholder="Label (optional)"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm col-span-2"
          />
          <select
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 sm:col-span-3 rounded-lg bg-primary text-white py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
        {DISPLAY_ORDER.map((day) => (
          <div key={day} className="bg-white rounded-xl border border-gray-100 p-2 min-h-[80px]">
            <p className="text-xs font-semibold text-gray-500 mb-1.5">{DAY_LABELS[day]}</p>
            <div className="space-y-1.5">
              {(byDay.get(day) ?? []).map(({ schedule, start, end }) => (
                <div
                  key={schedule.id}
                  className="group bg-primary-light rounded-lg px-2 py-1 text-xs text-primary-dark relative"
                >
                  <p className="font-medium">
                    {formatTime12h(start)}–{formatTime12h(end)}
                  </p>
                  {schedule.label && <p className="text-[11px] truncate">{schedule.label}</p>}
                  <button
                    type="button"
                    onClick={() => onDelete(schedule.id)}
                    className="absolute top-0.5 right-1 text-primary-dark/50 hover:text-stall opacity-0 group-hover:opacity-100 text-xs"
                    aria-label="Remove"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
