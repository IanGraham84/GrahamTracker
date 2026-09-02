export const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
];

// Reference week (Sun 2024-01-07 .. Sat 2024-01-13), used only to compute
// weekday-aware timezone conversions for the schedule grid.
const REFERENCE_DATES = [
  "2024-01-07",
  "2024-01-08",
  "2024-01-09",
  "2024-01-10",
  "2024-01-11",
  "2024-01-12",
  "2024-01-13",
];

function getOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return (asUTC - date.getTime()) / 60000;
}

/**
 * Converts a (day_of_week, HH:MM) wall-clock time in `fromTz` to the
 * equivalent (day_of_week, HH:MM) in `toTz`, for display purposes.
 */
export function convertDayTime(
  dayOfWeek: number,
  time: string,
  fromTz: string,
  toTz: string
): { dayOfWeek: number; time: string } {
  const [hh, mm] = time.split(":").map(Number);
  const refDate = REFERENCE_DATES[dayOfWeek];
  const [y, m, d] = refDate.split("-").map(Number);

  const naiveUTC = Date.UTC(y, m - 1, d, hh, mm);
  const offset = getOffsetMinutes(new Date(naiveUTC), fromTz);
  const actualUTC = new Date(naiveUTC - offset * 60000);

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: toTz,
    hourCycle: "h23",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(actualUTC);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    dayOfWeek: weekdayMap[map.weekday] ?? dayOfWeek,
    time: `${map.hour}:${map.minute}`,
  };
}

export function formatTime12h(time: string): string {
  const [hh, mm] = time.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${String(mm).padStart(2, "0")} ${period}`;
}
