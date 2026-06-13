import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type SelfAvailability = { workStart: number; workEnd: number; workDays: number[] };

const DEFAULTS = { pinColor: "marigold", bodyPalette: "sage" };
const DEFAULT_SELF: SelfAvailability = { workStart: 9, workEnd: 17, workDays: [1, 2, 3, 4, 5] };

const LS_PIN = "pangea.pinColor";
const LS_BODY = "pangea.bodyPalette";
const LS_SELF = "pangea.selfAvailability";

function coerceSelf(value: unknown): SelfAvailability {
  const s = (value ?? {}) as Partial<SelfAvailability>;
  return {
    workStart: typeof s.workStart === "number" ? s.workStart : DEFAULT_SELF.workStart,
    workEnd: typeof s.workEnd === "number" ? s.workEnd : DEFAULT_SELF.workEnd,
    workDays: Array.isArray(s.workDays) ? s.workDays : DEFAULT_SELF.workDays,
  };
}

function readLocal(): { pinColor: string; bodyPalette: string; self: SelfAvailability } {
  let self = DEFAULT_SELF;
  try {
    const raw = localStorage.getItem(LS_SELF);
    if (raw) self = coerceSelf(JSON.parse(raw));
  } catch {
    /* keep default */
  }
  return {
    pinColor: localStorage.getItem(LS_PIN) ?? DEFAULTS.pinColor,
    bodyPalette: localStorage.getItem(LS_BODY) ?? DEFAULTS.bodyPalette,
    self,
  };
}

function readUser(user: User): { pinColor: string; bodyPalette: string; self: SelfAvailability } {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    pinColor: typeof meta.pin_color === "string" ? meta.pin_color : DEFAULTS.pinColor,
    bodyPalette: typeof meta.body_palette === "string" ? meta.body_palette : DEFAULTS.bodyPalette,
    self: coerceSelf(meta.self_availability),
  };
}

export function usePreferences(user: User | null) {
  const [pinColor, setPinColor] = useState(DEFAULTS.pinColor);
  const [bodyPalette, setBodyPalette] = useState(DEFAULTS.bodyPalette);
  const [selfAvailability, setSelfAvailability] = useState<SelfAvailability>(DEFAULT_SELF);
  const selfRef = useRef(selfAvailability);
  selfRef.current = selfAvailability;

  useEffect(() => {
    const next = user ? readUser(user) : readLocal();
    setPinColor(next.pinColor);
    setBodyPalette(next.bodyPalette);
    setSelfAvailability(next.self);
  }, [user]);

  const updatePinColor = useCallback(
    async (id: string) => {
      setPinColor(id);
      if (user) {
        await supabase.auth.updateUser({ data: { pin_color: id } });
      } else {
        localStorage.setItem(LS_PIN, id);
      }
    },
    [user],
  );

  const updateBodyPalette = useCallback(
    async (id: string) => {
      setBodyPalette(id);
      if (user) {
        await supabase.auth.updateUser({ data: { body_palette: id } });
      } else {
        localStorage.setItem(LS_BODY, id);
      }
    },
    [user],
  );

  const updateSelfAvailability = useCallback(
    async (patch: Partial<SelfAvailability>) => {
      const next = { ...selfRef.current, ...patch };
      setSelfAvailability(next);
      if (user) {
        await supabase.auth.updateUser({ data: { self_availability: next } });
      } else {
        localStorage.setItem(LS_SELF, JSON.stringify(next));
      }
    },
    [user],
  );

  return {
    pinColor,
    bodyPalette,
    selfAvailability,
    setPinColor: updatePinColor,
    setBodyPalette: updateBodyPalette,
    setSelfAvailability: updateSelfAvailability,
  };
}
