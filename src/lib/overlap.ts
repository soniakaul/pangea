import type { Person } from "../data/store";
import { localDateInTz, localDayOfWeekInTz, tzOffsetMinutes } from "./time";

const SLOT_MIN = 30;
const SLOTS_PER_DAY = (24 * 60) / SLOT_MIN;

function localHours(person: Person, at: Date): number {
  const offset = tzOffsetMinutes(person.timezone, at);
  const localMinutes =
    (at.getUTCHours() * 60 + at.getUTCMinutes() + offset + 24 * 60) % (24 * 60);
  return localMinutes / 60;
}

function inHourRange(h: number, start: number, end: number): boolean {
  // If end <= start, the range wraps past midnight (e.g., 22:00–02:00).
  if (end > start) return h >= start && h < end;
  return h >= start || h < end;
}

export function isPersonWorking(person: Person, at: Date): boolean {
  const dow = localDayOfWeekInTz(person.timezone, at);
  if (!person.workDays.includes(dow)) return false;

  const localDate = localDateInTz(person.timezone, at);
  if (person.daysOff?.includes(localDate)) return false;

  const h = localHours(person, at);
  return inHourRange(h, person.workStart, person.workEnd);
}

export function isPersonAwake(person: Person, at: Date): boolean {
  const wakeStart = person.wakeStart ?? 7;
  const wakeEnd = person.wakeEnd ?? 23;
  const h = localHours(person, at);
  return inHourRange(h, wakeStart, wakeEnd);
}

export type DayPhase = "sunrise" | "day" | "sunset" | "night";

export function dayPhase(person: Person, at: Date): DayPhase {
  const h = localHours(person, at);
  if (h >= 6 && h < 10) return "sunrise";
  if (h >= 10 && h < 16) return "day";
  if (h >= 16 && h < 19) return "sunset";
  return "night";
}

export type Slot = { start: Date; availableIds: string[] };

export function buildSlots(people: Person[], startOfDay: Date, days = 7): Slot[] {
  const slots: Slot[] = [];
  for (let d = 0; d < days; d++) {
    for (let s = 0; s < SLOTS_PER_DAY; s++) {
      const start = new Date(
        startOfDay.getTime() + d * 24 * 60 * 60 * 1000 + s * SLOT_MIN * 60 * 1000,
      );
      const availableIds = people.filter((p) => isPersonWorking(p, start)).map((p) => p.id);
      slots.push({ start, availableIds });
    }
  }
  return slots;
}

export type BestSlot = {
  start: Date;
  end: Date;
  attendees: string[];
};

export function findBestMeeting(slots: Slot[], people: Person[]): BestSlot | null {
  if (people.length === 0) return null;
  let best: BestSlot | null = null;
  const future = slots.filter((s) => s.start.getTime() > Date.now());
  for (const slot of future) {
    if (slot.availableIds.length === people.length) {
      return {
        start: slot.start,
        end: new Date(slot.start.getTime() + SLOT_MIN * 60 * 1000),
        attendees: slot.availableIds,
      };
    }
    if (!best || slot.availableIds.length > best.attendees.length) {
      best = {
        start: slot.start,
        end: new Date(slot.start.getTime() + SLOT_MIN * 60 * 1000),
        attendees: slot.availableIds,
      };
    }
  }
  return best;
}
