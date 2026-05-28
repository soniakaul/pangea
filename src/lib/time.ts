export function tzOffsetMinutes(timezone: string, at: Date = new Date()): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(at).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((asUtc - at.getTime()) / 60000);
}

export function localHoursInTz(timezone: string, at: Date = new Date()): number {
  const offset = tzOffsetMinutes(timezone, at);
  const minutesSinceMidnightUtc = at.getUTCHours() * 60 + at.getUTCMinutes();
  const local = (minutesSinceMidnightUtc + offset + 24 * 60) % (24 * 60);
  return local / 60;
}

export function localDayOfWeekInTz(timezone: string, at: Date = new Date()): number {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" });
  const day = dtf.format(at);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day);
}

export function localDateInTz(timezone: string, at: Date = new Date()): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return dtf.format(at);
}

export function formatLocalTime(timezone: string, at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(at);
}

export function shortTzLabel(timezone: string, at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  }).formatToParts(at);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}
