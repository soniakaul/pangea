import { useEffect, useState } from "react";
import WireGlobe from "./WireGlobe";

type Props = {
  onDone: () => void;
  durationMs?: number;
};

export default function Splash({ onDone, durationMs = 2400 }: Props) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fadeAt = durationMs - 500;
    const fade = setTimeout(() => setLeaving(true), fadeAt);
    const done = setTimeout(onDone, durationMs);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, [durationMs, onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "#ede0c0", color: "#1c1410" }}
    >
      <WireGlobe size={180} strokeWidth={1.25} />
      <div className="mt-8 font-serif text-3xl tracking-[0.35em] lowercase">
        pangea
      </div>
    </div>
  );
}
