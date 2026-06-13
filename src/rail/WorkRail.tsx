import { useMemo, useState } from "react";
import type { Person } from "../data/store";
import type { SelfAvailability } from "../data/usePreferences";
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
  selfCityName: string;
  selfAvailability: SelfAvailability;
  onSelfAvailabilityChange: (patch: Partial<SelfAvailability>) => void;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onAdd: (person: Omit<Person, "id">) => void;
  onUpdate: (id: string, patch: Partial<Person>) => void;
  onRemove: (id: string) => void;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function fmtHour(h: number): string {
  // 24 is the end-of-day value; display it as midnight (00:00).
  return `${(h % 24).toString().padStart(2, "0")}:00`;
}

const INLINE_SELECT = {
  fontFamily: "ui-serif, Georgia, serif",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: RAIL_HIGHLIGHT,
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${RAIL_BORDER}`,
  cursor: "pointer",
  padding: "1px 2px",
  outline: "none",
} as const;

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
  selfCityName,
  selfAvailability,
  onSelfAvailabilityChange,
  onHover,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [durationMin, setDurationMin] = useState(30);
  const [horizonDays, setHorizonDays] = useState(7);

  const best = useMemo(() => {
    if (peopleForBestMeeting.length === 0) return null;
    const startOfHour = new Date(now);
    startOfHour.setMinutes(0, 0, 0);
    const slots = buildSlots(peopleForBestMeeting, startOfHour, horizonDays);
    return findBestMeeting(slots, peopleForBestMeeting, durationMin);
  }, [peopleForBestMeeting, now, horizonDays, durationMin]);

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
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>Best</span>
          <select
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            style={INLINE_SELECT}
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>90 min</option>
            <option value={120}>2 hours</option>
          </select>
          <span>· next</span>
          <select
            value={horizonDays}
            onChange={(e) => setHorizonDays(Number(e.target.value))}
            style={INLINE_SELECT}
          >
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
          </select>
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
                ? `all ${peopleForBestMeeting.length} in working hours`
                : `${best.attendees.length} of ${peopleForBestMeeting.length} in working hours · missing ${peopleForBestMeeting
                    .filter((p) => !best.attendees.includes(p.id))
                    .map((p) => p.name)
                    .join(", ")}`}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: RAIL_MUTED }}>Add teammates to find overlap.</div>
        )}
      </div>

      <SelfAvailabilityCard
        cityName={selfCityName}
        availability={selfAvailability}
        onChange={onSelfAvailabilityChange}
      />

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

function SelfAvailabilityCard({
  cityName,
  availability,
  onChange,
}: {
  cityName: string;
  availability: SelfAvailability;
  onChange: (patch: Partial<SelfAvailability>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const { workStart, workEnd, workDays } = availability;

  function toggleDay(d: number) {
    const next = workDays.includes(d)
      ? workDays.filter((x) => x !== d)
      : [...workDays, d].sort();
    onChange({ workDays: next });
  }

  const daysSummary =
    workDays.length === 0
      ? "no days set"
      : DAY_LABELS.filter((_, d) => workDays.includes(d)).join(" ");

  return (
    <div
      style={{
        padding: "12px 14px",
        margin: "8px 14px 0",
        background: RAIL_PARCHMENT,
        borderRadius: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: RAIL_MUTED }}>
          Your availability
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
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
          {editing ? "done" : "edit"}
        </button>
      </div>

      {!editing ? (
        <div style={{ fontSize: 13, color: RAIL_INK, fontFamily: "ui-serif, Georgia, serif" }}>
          {fmtHour(workStart)}–{fmtHour(workEnd)}
          <span style={{ color: RAIL_MUTED, marginLeft: 8 }}>{daysSummary}</span>
          <div style={{ fontSize: 11, color: RAIL_MUTED, marginTop: 2 }}>
            {cityName}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <div style={SELF_LABEL}>Starts</div>
              <select
                value={workStart}
                onChange={(e) => onChange({ workStart: Number(e.target.value) })}
                style={SELF_INPUT}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {fmtHour(h)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={SELF_LABEL}>Ends</div>
              <select
                value={workEnd}
                onChange={(e) => onChange({ workEnd: Number(e.target.value) })}
                style={SELF_INPUT}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h + 1}>
                    {fmtHour(h + 1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div style={SELF_LABEL}>Days</div>
            <div style={{ display: "flex", gap: 4 }}>
              {DAY_LABELS.map((label, d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 2,
                    border: "1px solid #c9a872",
                    background: workDays.includes(d) ? "#3d2410" : "transparent",
                    color: workDays.includes(d) ? "#faf3e0" : "#7a5a30",
                    fontFamily: "ui-serif, Georgia, serif",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SELF_LABEL = {
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "#7a5a30",
  marginBottom: 4,
  display: "block",
} as const;

const SELF_INPUT = {
  width: "100%",
  padding: "6px 10px",
  border: "1px solid #c9a872",
  borderRadius: 2,
  background: "#faf3e0",
  color: "#1c1410",
  fontFamily: "ui-serif, Georgia, serif",
  fontSize: 13,
  outline: "none",
} as const;
