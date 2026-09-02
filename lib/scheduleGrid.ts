import { AgentSchedule } from "./types";
import { zonedDayTimeToUtc, utcToZonedDayTime } from "./tz";

export type HourSlot = { dayOfWeek: number; hour: number };

/**
 * Expands one schedule block into the list of (day_of_week, hour) slots it
 * occupies once converted into `viewTz` — a block can span into an adjacent
 * hour, or even an adjacent day, once shifted across timezones.
 */
export function scheduleOccupiedSlots(schedule: AgentSchedule, viewTz: string): HourSlot[] {
  const startUtc = zonedDayTimeToUtc(schedule.day_of_week, schedule.start_time.slice(0, 5), schedule.timezone);
  const endUtc = zonedDayTimeToUtc(schedule.day_of_week, schedule.end_time.slice(0, 5), schedule.timezone);

  const slots: HourSlot[] = [];
  const cursor = new Date(startUtc);
  cursor.setUTCMinutes(0, 0, 0);
  while (cursor.getTime() < endUtc.getTime()) {
    const { dayOfWeek, time } = utcToZonedDayTime(cursor, viewTz);
    slots.push({ dayOfWeek, hour: Number(time.slice(0, 2)) });
    cursor.setTime(cursor.getTime() + 60 * 60 * 1000);
  }
  return slots;
}

export function slotKey(dayOfWeek: number, hour: number): string {
  return `${dayOfWeek}-${hour}`;
}

/**
 * Buckets schedules into a day/hour -> schedule[] map (in `viewTz`), and
 * reports the min/max hour actually in use so the grid can size itself to
 * the agency's real working hours instead of a fixed guess.
 */
export function buildHourGrid(
  schedules: AgentSchedule[],
  viewTz: string
): { bySlot: Map<string, AgentSchedule[]>; minHour: number | null; maxHour: number | null } {
  const bySlot = new Map<string, AgentSchedule[]>();
  let minHour: number | null = null;
  let maxHour: number | null = null;

  for (const schedule of schedules) {
    for (const { dayOfWeek, hour } of scheduleOccupiedSlots(schedule, viewTz)) {
      const key = slotKey(dayOfWeek, hour);
      const list = bySlot.get(key) ?? [];
      list.push(schedule);
      bySlot.set(key, list);
      minHour = minHour === null ? hour : Math.min(minHour, hour);
      maxHour = maxHour === null ? hour : Math.max(maxHour, hour);
    }
  }

  return { bySlot, minHour, maxHour };
}
