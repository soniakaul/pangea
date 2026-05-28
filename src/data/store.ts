import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type Circle = "work" | "personal";

export type Person = {
  id: string;
  name: string;
  cityName: string;
  countryCode: string;
  timezone: string;
  lat: number;
  lng: number;
  workStart: number;
  workEnd: number;
  workDays: number[];
  daysOff?: string[];
  favorite?: boolean;
  wakeStart?: number;
  wakeEnd?: number;
  relationship?: string;
};

export type Store = Record<Circle, Person[]>;

const KEY = "pangea.guest.store.v4";

function seed(): Store {
  return { work: [], personal: [] };
}

function loadLocal(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.work || !parsed.personal) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

function saveLocal(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

type DbRow = {
  id: string;
  user_id: string;
  circle: Circle;
  name: string;
  city_name: string;
  country_code: string;
  timezone: string;
  lat: number;
  lng: number;
  work_start: number;
  work_end: number;
  work_days: number[];
  days_off: string[] | null;
  favorite: boolean | null;
  wake_start: number | null;
  wake_end: number | null;
  relationship: string | null;
  created_at: string;
};

function rowToPerson(row: DbRow): Person {
  return {
    id: row.id,
    name: row.name,
    cityName: row.city_name,
    countryCode: row.country_code,
    timezone: row.timezone,
    lat: row.lat,
    lng: row.lng,
    workStart: row.work_start,
    workEnd: row.work_end,
    workDays: row.work_days,
    daysOff: row.days_off ?? undefined,
    favorite: row.favorite ?? undefined,
    wakeStart: row.wake_start ?? undefined,
    wakeEnd: row.wake_end ?? undefined,
    relationship: row.relationship ?? undefined,
  };
}

function personToRow(userId: string, circle: Circle, p: Omit<Person, "id">) {
  return {
    user_id: userId,
    circle,
    name: p.name,
    city_name: p.cityName,
    country_code: p.countryCode,
    timezone: p.timezone,
    lat: p.lat,
    lng: p.lng,
    work_start: p.workStart,
    work_end: p.workEnd,
    work_days: p.workDays,
    days_off: p.daysOff ?? null,
    favorite: p.favorite ?? false,
    wake_start: p.wakeStart ?? null,
    wake_end: p.wakeEnd ?? null,
    relationship: p.relationship ?? null,
  };
}

async function loadRemote(): Promise<Store> {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const out: Store = { work: [], personal: [] };
  for (const row of (data as DbRow[]) ?? []) {
    out[row.circle].push(rowToPerson(row));
  }
  return out;
}

export function useStore(user: User | null) {
  const [store, setStore] = useState<Store>(() => loadLocal());
  const [syncing, setSyncing] = useState(false);
  const migratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function sync() {
      if (!user) {
        setStore(loadLocal());
        return;
      }
      setSyncing(true);
      try {
        const remote = await loadRemote();
        const local = loadLocal();
        const remoteEmpty = remote.work.length === 0 && remote.personal.length === 0;
        const localHasGuestData = local.work.length > 0 || local.personal.length > 0;

        if (remoteEmpty && localHasGuestData && !migratedRef.current) {
          migratedRef.current = true;
          const rows: ReturnType<typeof personToRow>[] = [];
          for (const circle of ["work", "personal"] as const) {
            for (const p of local[circle]) {
              rows.push(personToRow(user.id, circle, p));
            }
          }
          if (rows.length > 0) {
            await supabase.from("people").insert(rows);
          }
          const fresh = await loadRemote();
          if (!cancelled) setStore(fresh);
        } else {
          if (!cancelled) setStore(remoteEmpty ? seed() : remote);
        }
      } catch (e) {
        console.error("[pangea] sync failed", e);
        if (!cancelled) setStore(loadLocal());
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }
    sync();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    // Only persist locally when in guest mode. Authed data lives in Supabase
    // only — never written to localStorage so it can't leak into guest mode.
    if (!user) saveLocal(store);
  }, [store, user]);

  const addPerson = useCallback(
    async (circle: Circle, person: Omit<Person, "id">) => {
      if (user) {
        const { data, error } = await supabase
          .from("people")
          .insert(personToRow(user.id, circle, person))
          .select()
          .single();
        if (error) {
          console.error("[pangea] addPerson failed", error);
          return;
        }
        setStore((s) => ({ ...s, [circle]: [...s[circle], rowToPerson(data as DbRow)] }));
      } else {
        setStore((s) => ({
          ...s,
          [circle]: [...s[circle], { ...person, id: crypto.randomUUID() }],
        }));
      }
    },
    [user],
  );

  const updatePerson = useCallback(
    async (circle: Circle, id: string, patch: Partial<Person>) => {
      if (user) {
        const updates: Record<string, unknown> = {};
        if (patch.name !== undefined) updates.name = patch.name;
        if (patch.cityName !== undefined) updates.city_name = patch.cityName;
        if (patch.countryCode !== undefined) updates.country_code = patch.countryCode;
        if (patch.timezone !== undefined) updates.timezone = patch.timezone;
        if (patch.lat !== undefined) updates.lat = patch.lat;
        if (patch.lng !== undefined) updates.lng = patch.lng;
        if (patch.workStart !== undefined) updates.work_start = patch.workStart;
        if (patch.workEnd !== undefined) updates.work_end = patch.workEnd;
        if (patch.workDays !== undefined) updates.work_days = patch.workDays;
        if (patch.daysOff !== undefined) updates.days_off = patch.daysOff;
        if (patch.favorite !== undefined) updates.favorite = patch.favorite;
        if (patch.wakeStart !== undefined) updates.wake_start = patch.wakeStart;
        if (patch.wakeEnd !== undefined) updates.wake_end = patch.wakeEnd;
        if (patch.relationship !== undefined) updates.relationship = patch.relationship;
        const { error } = await supabase.from("people").update(updates).eq("id", id);
        if (error) {
          console.error("[pangea] updatePerson failed", error);
          return;
        }
      }
      setStore((s) => ({
        ...s,
        [circle]: s[circle].map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
    [user],
  );

  const removePerson = useCallback(
    async (circle: Circle, id: string) => {
      if (user) {
        const { error } = await supabase.from("people").delete().eq("id", id);
        if (error) {
          console.error("[pangea] removePerson failed", error);
          return;
        }
      }
      setStore((s) => ({ ...s, [circle]: s[circle].filter((p) => p.id !== id) }));
    },
    [user],
  );

  const toggleFavorite = useCallback(
    async (circle: Circle, id: string) => {
      const current = store[circle].find((p) => p.id === id);
      if (!current) return;
      const next = !current.favorite;
      if (user) {
        const { error } = await supabase
          .from("people")
          .update({ favorite: next })
          .eq("id", id);
        if (error) {
          console.error("[pangea] toggleFavorite failed", error);
          return;
        }
      }
      setStore((s) => ({
        ...s,
        [circle]: s[circle].map((p) => (p.id === id ? { ...p, favorite: next } : p)),
      }));
    },
    [user, store],
  );

  return { store, addPerson, updatePerson, removePerson, toggleFavorite, syncing };
}
