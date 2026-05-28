import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

const DEFAULTS = { pinColor: "marigold", bodyPalette: "sage" };

const LS_PIN = "pangea.pinColor";
const LS_BODY = "pangea.bodyPalette";

function readLocal(): { pinColor: string; bodyPalette: string } {
  return {
    pinColor: localStorage.getItem(LS_PIN) ?? DEFAULTS.pinColor,
    bodyPalette: localStorage.getItem(LS_BODY) ?? DEFAULTS.bodyPalette,
  };
}

function readUser(user: User): { pinColor: string; bodyPalette: string } {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    pinColor: typeof meta.pin_color === "string" ? meta.pin_color : DEFAULTS.pinColor,
    bodyPalette: typeof meta.body_palette === "string" ? meta.body_palette : DEFAULTS.bodyPalette,
  };
}

export function usePreferences(user: User | null) {
  const [pinColor, setPinColor] = useState(DEFAULTS.pinColor);
  const [bodyPalette, setBodyPalette] = useState(DEFAULTS.bodyPalette);

  useEffect(() => {
    if (user) {
      const fromUser = readUser(user);
      setPinColor(fromUser.pinColor);
      setBodyPalette(fromUser.bodyPalette);
    } else {
      const local = readLocal();
      setPinColor(local.pinColor);
      setBodyPalette(local.bodyPalette);
    }
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

  return { pinColor, bodyPalette, setPinColor: updatePinColor, setBodyPalette: updateBodyPalette };
}
