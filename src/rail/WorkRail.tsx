import { useMemo, useState } from "react";
import type { Person } from "../data/store";
import { buildSlots, findBestMeeting, isPersonWorking } from "../lib/overlap";
import PersonForm from "./PersonForm";
import PersonRow from "./PersonRow";
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
  peopleForBestMeeting: Person[];
  now: Date;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onAdd: (person: Omit<Person, "id">) => void;
  onUpdate: (id: string, patch: Partial<Person>) => void;
  onRemove: (id: string) => void;
};

function formatBest(start: Date, end: Date): { day: string; time: string } {
  const day = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);
  const time = `${new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(start)} – ${new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(end)}`;
  return { day, time };
}

export default function WorkRail({
  people,
  peopleForBestMeeting,
  now,
  hoveredId,
  onHover,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const best = useMemo(() => {
    if (peopleForBestMeeting.length === 0) return null;
    const startOfHour = new Date(now);
    startOfHour.setMinutes(0, 0, 0);
    const slots = buildSlots(peopleForBestMeeting, startOfHour, 7);
    return findBestMeeting(slots, peopleForBestMeeting);
  }, [peopleForBestMeeting, now]);

  const sorted = useMemo(() => {
    return [...people].sort((a, b) => {
      const aw = isPersonWorking(a, now);
      const bw = isPersonWorking(b, now);
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
          Best 30 min · next 7 days
        </div>
        {best ? (
          <div>
            <div
              style={{
                fontFamily: "ui-serif, Georgia, serif",
                fontSize: 18,
                color: RAIL_INK,
                lineHeight: 1.3,
              }}
            >
              {formatBest(best.start, best.end).day}
            </div>
            <div
              style={{
                fontFamily: "ui-serif, Georgia, serif",
                fontSize: 16,
                color: RAIL_HIGHLIGHT,
                marginTop: 2,
              }}
            >
              {formatBest(best.start, best.end).time}
            </div>
            <div style={{ fontSize: 11, color: RAIL_MUTED, marginTop: 6 }}>
              {best.attendees.length === peopleForBestMeeting.length
                ? `all ${peopleForBestMeeting.length} free (incl. you)`
                : `${best.attendees.length} of ${peopleForBestMeeting.length} free · missing ${peopleForBestMeeting
                    .filter((p) => !best.attendees.includes(p.id))
                    .map((p) => p.name)
                    .join(", ")}`}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: RAIL_MUTED }}>Add teammates to find overlap.</div>
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
          Team · {people.length}
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
            circle="work"
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
                  circle="work"
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
                active={isPersonWorking(p, now)}
                hovered={hoveredId === p.id}
                showFavorite={false}
                onHover={onHover}
                onSelect={onSelect}
                onEdit={setEditingId}
                onRemove={onRemove}
              />
            )}
          </div>
        ))}
        {sorted.length === 0 && !adding && (
          <div style={{ padding: 32, textAlign: "center", color: RAIL_MUTED, fontSize: 13 }}>
            No teammates yet.
          </div>
        )}
      </div>
    </aside>
  );
}
