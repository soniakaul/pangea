type Props = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  spinning?: boolean;
  duration?: number;
};

export default function WireGlobe({
  size = 160,
  strokeWidth = 1.25,
  className,
  spinning = true,
  duration = 6,
}: Props) {
  const meridians = [0, 1, 2, 3, 4, 5];

  return (
    <svg
      viewBox="-100 -100 200 200"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      >
        <circle cx="0" cy="0" r="82" />

        <line x1="-82" y1="0" x2="82" y2="0" opacity="0.55" />
        <ellipse cx="0" cy="0" rx="82" ry="28" opacity="0.55" />
        <ellipse cx="0" cy="0" rx="74" ry="52" opacity="0.55" />
        <ellipse cx="0" cy="0" rx="60" ry="72" opacity="0.55" />

        <line x1="0" y1="-82" x2="0" y2="82" opacity="0.55" />

        {meridians.map((i) => {
          const begin = -(i * duration) / meridians.length;
          return (
            <ellipse key={i} cx="0" cy="0" rx="82" ry="82">
              {spinning && (
                <animate
                  attributeName="rx"
                  values="82;0;82"
                  keyTimes="0;0.5;1"
                  dur={`${duration}s`}
                  begin={`${begin}s`}
                  repeatCount="indefinite"
                />
              )}
            </ellipse>
          );
        })}
      </g>
    </svg>
  );
}
