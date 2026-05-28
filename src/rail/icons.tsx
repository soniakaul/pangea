import type { DayPhase } from "../lib/overlap";

type IconProps = {
  size?: number;
  color?: string;
};

export function SunIcon({ size = 14, color = "#7a5a30" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true">
      <circle cx="0" cy="0" r="4" fill="none" stroke={color} strokeWidth="1.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={Math.cos(rad) * 7}
            y1={Math.sin(rad) * 7}
            x2={Math.cos(rad) * 10}
            y2={Math.sin(rad) * 10}
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function SunriseIcon({ size = 14, color = "#7a5a30" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true">
      <path
        d="M -4.5,5 A 4.5,4.5 0 0,1 4.5,5 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="0" y1="-9" x2="0" y2="-7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-4.5" y1="-7" x2="-3.5" y2="-5.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="4.5" y1="-7" x2="3.5" y2="-5.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-8.5" y1="-3" x2="-7" y2="-2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8.5" y1="-3" x2="7" y2="-2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-10" y1="5" x2="-5.5" y2="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5.5" y1="5" x2="10" y2="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-8" y1="9" x2="8" y2="9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SunsetIcon({ size = 14, color = "#7a5a30" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true">
      <path
        d="M -4.5,5 A 4.5,4.5 0 0,1 4.5,5 Z"
        fill={color}
      />
      <line x1="0" y1="-9" x2="0" y2="-7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-4.5" y1="-7" x2="-3.5" y2="-5.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="4.5" y1="-7" x2="3.5" y2="-5.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-8.5" y1="-3" x2="-7" y2="-2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8.5" y1="-3" x2="7" y2="-2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-10" y1="5" x2="-5.5" y2="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5.5" y1="5" x2="10" y2="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="-8" y1="9" x2="8" y2="9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon({ size = 14, color = "#7a5a30" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true">
      <path
        d="M 6,2 A 8,8 0 1 1 -4,-7 A 6.5,6.5 0 0 0 6,2 Z"
        fill={color}
      />
      <path
        d="M 8,-5 L 8.6,-3.4 L 10.2,-2.8 L 8.6,-2.2 L 8,-0.6 L 7.4,-2.2 L 5.8,-2.8 L 7.4,-3.4 Z"
        fill={color}
      />
      <path
        d="M 9.5,4 L 9.8,4.7 L 10.5,5 L 9.8,5.3 L 9.5,6 L 9.2,5.3 L 8.5,5 L 9.2,4.7 Z"
        fill={color}
      />
    </svg>
  );
}

export function PhaseIcon({
  phase,
  size,
  color,
}: { phase: DayPhase } & IconProps) {
  switch (phase) {
    case "sunrise":
      return <SunriseIcon size={size} color={color} />;
    case "day":
      return <SunIcon size={size} color={color} />;
    case "sunset":
      return <SunsetIcon size={size} color={color} />;
    case "night":
      return <MoonIcon size={size} color={color} />;
  }
}

export function StarIcon({
  size = 14,
  color = "#b8862a",
  filled = false,
}: IconProps & { filled?: boolean }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 7 : 3;
    return `${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox="-9 -9 18 18" aria-hidden="true">
      <polygon
        points={points}
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

