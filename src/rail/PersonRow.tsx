import type { Person } from "../data/store";
import { formatLocalTime, shortTzLabel } from "../lib/time";
import { dayPhase } from "../lib/overlap";
import { PhaseIcon, StarIcon } from "./icons";
import { RAIL_BORDER, RAIL_HIGHLIGHT, RAIL_HOVER_BG, RAIL_INK, RAIL_MUTED } from "./styles";

type Props = {
  person: Person;
  now: Date;
  active: boolean;
  hovered: boolean;
  showFavorite: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
};

export default function PersonRow({
  person,
  now,
  active,
  hovered,
  showFavorite,
  onHover,
  onSelect,
  onEdit,
  onRemove,
  onToggleFavorite,
}: Props) {
  const phase = dayPhase(person, now);
  const tz = shortTzLabel(person.timezone, now);

  return (
    <div
      onMouseEnter={() => onHover(person.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(person.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderBottom: `1px solid ${RAIL_BORDER}40`,
        background: hovered ? RAIL_HOVER_BG : "transparent",
        opacity: active ? 1 : 0.55,
        cursor: "pointer",
        transition: "background 120ms, opacity 200ms",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: active ? "#a07434" : "transparent",
          border: active ? "none" : `1px solid ${RAIL_MUTED}`,
          flexShrink: 0,
        }}
        title={active ? "available" : "off-hours"}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            color: RAIL_INK,
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: 14,
          }}
        >
          <span style={{ fontWeight: 500 }}>{person.name}</span>
          {showFavorite && person.favorite && (
            <span style={{ display: "inline-flex" }}>
              <StarIcon size={11} color="#b8862a" filled />
            </span>
          )}
          {person.relationship && (
            <span
              style={{
                fontSize: 9,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: RAIL_MUTED,
              }}
            >
              {person.relationship}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: RAIL_MUTED,
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 2,
            flexWrap: "nowrap",
          }}
        >
          {/* City is the only flexible element — it truncates so the time + zone
              never wrap or compress (e.g. GMT+5:30 is wider than GMT+8). */}
          <span
            style={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {person.cityName}
          </span>
          <span
            style={{ fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {formatLocalTime(person.timezone, now)}
          </span>
          {tz && (
            <span style={{ fontSize: 10, whiteSpace: "nowrap", flexShrink: 0 }}>{tz}</span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
            <PhaseIcon phase={phase} size={12} color={RAIL_MUTED} />
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {showFavorite && onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(person.id);
            }}
            title={person.favorite ? "Unpin" : "Pin"}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 2,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <StarIcon size={14} color={person.favorite ? "#b8862a" : RAIL_MUTED} filled={!!person.favorite} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(person.id);
          }}
          style={btnStyle()}
          title="Edit"
        >
          edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(person.id);
          }}
          style={{ ...btnStyle(), color: RAIL_MUTED }}
          title="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function btnStyle() {
  return {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: RAIL_HIGHLIGHT,
    fontFamily: "ui-serif, Georgia, serif",
    fontSize: 11,
    letterSpacing: 1,
    padding: 2,
  } as const;
}
