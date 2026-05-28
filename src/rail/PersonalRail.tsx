import { useMemo, useState } from "react";
import type { Person } from "../data/store";
import { dayPhase, isPersonAwake } from "../lib/overlap";
import { formatLocalTime } from "../lib/time";
import PersonForm from "./PersonForm";
import PersonRow from "./PersonRow";
import { PhaseIcon } from "./icons";
import {
  RAIL_BG,
  RAIL_BORDER,
  RAIL_HIGHLIGHT,
  RAIL_INK,
  RAIL_MUTED,
  RAIL_PARCHMENT,
} from "./styles";

type Props = {
  people: Person[];
  now: Date;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onAdd: (person: Omit<Person, "id">) => void;
  onUpdate: (id: string, patch: Partial<Person>) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

export default function PersonalRail({
  people,
  now,
  hoveredId,
  onHover,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
  onToggleFavorite,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const callNow = useMemo(() => {
    return people
      .filter((p) => p.favorite && isPersonAwake(p, now))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [people, now]);

  const sorted = useMemo(() => {
    return [...people].sort((a, b) => {
      const aFav = a.favorite ? 1 : 0;
      const bFav = b.favorite ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      const aw = isPersonAwake(a, now);
      const bw = isPersonAwake(b, now);
      if (aw !== bw) return aw ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [people, now]);

  return (
    <aside
      style={{
        width: 320,
        borderLeft: `1px solid ${RAIL_BORDER}`,
        background: RAIL_BG,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: 16,
          borderBottom: `1px solid ${RAIL_BORDER}40`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: RAIL_MUTED,
            marginBottom: 8,
          }}
        >
          Favorites awake
        </div>
        {callNow.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {callNow.map((p) => (
              <div
                key={p.id}
                onMouseEnter={() => onHover(p.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(p.id)}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: 2,
                  background: hoveredId === p.id ? "rgba(160,116,52,0.15)" : "transparent",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <PhaseIcon phase={dayPhase(p, now)} size={14} color={RAIL_MUTED} />
                </span>
                <span
                  style={{
                    fontFamily: "ui-serif, Georgia, serif",
                    fontSize: 16,
                    color: RAIL_INK,
                  }}
                >
                  {p.name}
                </span>
                <span style={{ fontSize: 11, color: RAIL_MUTED, marginLeft: "auto" }}>
                  {formatLocalTime(p.timezone, now)}
                </span>
              </div>
            ))}
          </div>
        ) : people.some((p) => p.favorite) ? (
          <div style={{ fontSize: 13, color: RAIL_MUTED }}>
            No favorites are awake right now. Check back in a few hours.
          </div>
        ) : (
          <div style={{ fontSize: 13, color: RAIL_MUTED }}>
            Star someone below to add them to Call Now.
          </div>
        )}
      </div>

      <div
        style={{
          padding: "12px 14px 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: RAIL_MUTED,
          }}
        >
          Everyone · {people.length}
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            style={{
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: 12,
              color: RAIL_HIGHLIGHT,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            + add
          </button>
        )}
      </div>

      {adding && (
        <div style={{ padding: 14, background: RAIL_PARCHMENT, margin: "8px 14px", borderRadius: 2 }}>
          <PersonForm
            circle="personal"
            submitLabel="Add"
            onCancel={() => setAdding(false)}
            onSubmit={(p) => {
              onAdd(p);
              setAdding(false);
            }}
          />
        </div>
      )}

      <div style={{ flex: 1 }}>
        {sorted.map((p) => (
          <div key={p.id}>
            {editingId === p.id ? (
              <div style={{ padding: 14, background: RAIL_PARCHMENT, margin: "8px 14px", borderRadius: 2 }}>
                <PersonForm
                  circle="personal"
                  initial={p}
                  submitLabel="Save"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(patch) => {
                    onUpdate(p.id, patch);
                    setEditingId(null);
                  }}
                />
              </div>
            ) : (
              <PersonRow
                person={p}
                now={now}
                active={isPersonAwake(p, now)}
                hovered={hoveredId === p.id}
                showFavorite={true}
                onHover={onHover}
                onSelect={onSelect}
                onEdit={setEditingId}
                onRemove={onRemove}
                onToggleFavorite={onToggleFavorite}
              />
            )}
          </div>
        ))}
        {sorted.length === 0 && !adding && (
          <div style={{ padding: 32, textAlign: "center", color: RAIL_MUTED, fontSize: 13 }}>
            No one here yet.
          </div>
        )}
      </div>
    </aside>
  );
}
