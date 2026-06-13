import { useEffect, useState } from "react";
import { searchCities, type CityResult } from "../lib/citySearch";
import { shortTzLabel } from "../lib/time";
import type { Circle, Person } from "../data/store";

type Props = {
  circle: Circle;
  initial?: Person;
  onSubmit: (person: Omit<Person, "id">) => void;
  onCancel: () => void;
  submitLabel: string;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const RAIL_INPUT = {
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

const RAIL_LABEL = {
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "#7a5a30",
  marginBottom: 4,
  display: "block",
} as const;

export default function PersonForm({ circle, initial, onSubmit, onCancel, submitLabel }: Props) {
  const isWork = circle === "work";
  const [name, setName] = useState(initial?.name ?? "");
  const [cityQuery, setCityQuery] = useState(initial?.cityName ?? "");
  const [selected, setSelected] = useState<CityResult | null>(
    initial
      ? {
          name: initial.cityName,
          country: "",
          countryCode: initial.countryCode,
          timezone: initial.timezone,
          lat: initial.lat,
          lng: initial.lng,
        }
      : null,
  );
  const [results, setResults] = useState<CityResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [workStart, setWorkStart] = useState(initial?.workStart ?? 9);
  const [workEnd, setWorkEnd] = useState(initial?.workEnd ?? 17);
  const [workDays, setWorkDays] = useState<number[]>(initial?.workDays ?? [1, 2, 3, 4, 5]);
  const [wakeStart, setWakeStart] = useState(initial?.wakeStart ?? 7);
  const [wakeEnd, setWakeEnd] = useState(initial?.wakeEnd ?? 23);
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [relationship, setRelationship] = useState(initial?.relationship ?? "");

  // Debounced any-city search; skipped once a city is locked in.
  useEffect(() => {
    if (selected || cityQuery.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(() => {
      searchCities(cityQuery)
        .then((r) => {
          if (!cancelled) {
            setResults(r);
            setSearching(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
            setSearching(false);
          }
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [cityQuery, selected]);

  function toggleDay(d: number) {
    setWorkDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selected) return;
    onSubmit({
      name: name.trim(),
      cityName: selected.name,
      countryCode: selected.countryCode,
      timezone: selected.timezone,
      lat: selected.lat,
      lng: selected.lng,
      workStart,
      workEnd,
      workDays,
      wakeStart,
      wakeEnd,
      favorite,
      relationship: relationship.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={RAIL_LABEL}>Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={RAIL_INPUT}
          placeholder={isWork ? "Maya" : "Mom"}
        />
      </div>

      <div>
        <label style={RAIL_LABEL}>City</label>
        <input
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setSelected(null);
          }}
          style={RAIL_INPUT}
          placeholder="Search any city"
        />
        {selected ? (
          <div style={{ fontSize: 11, color: "#7a5a30", marginTop: 4 }}>
            {selected.country ? `${selected.country} · ` : ""}
            {selected.timezone.replace(/_/g, " ")}
          </div>
        ) : (
          cityQuery.trim().length >= 2 && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "4px 0 0",
                maxHeight: 180,
                overflow: "auto",
                border: "1px solid #c9a872",
                borderRadius: 2,
                background: "#faf3e0",
              }}
            >
              {results.map((c, i) => (
                <li key={`${c.name}-${c.countryCode}-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(c);
                      setCityQuery(c.name);
                    }}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 8,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "ui-serif, Georgia, serif",
                      fontSize: 12,
                      color: "#1c1410",
                    }}
                  >
                    <span
                      style={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                      <span style={{ color: "#7a5a30", marginLeft: 8 }}>
                        {[c.admin, c.country].filter(Boolean).join(", ")}
                      </span>
                    </span>
                    <span style={{ color: "#a07434", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {shortTzLabel(c.timezone)}
                    </span>
                  </button>
                </li>
              ))}
              {!searching && results.length === 0 && (
                <li style={{ padding: "6px 10px", color: "#7a5a30", fontSize: 12 }}>
                  No matches
                </li>
              )}
              {searching && results.length === 0 && (
                <li style={{ padding: "6px 10px", color: "#7a5a30", fontSize: 12 }}>
                  Searching…
                </li>
              )}
            </ul>
          )
        )}
      </div>

      {isWork ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={RAIL_LABEL}>Work starts</label>
              <select
                value={workStart}
                onChange={(e) => setWorkStart(Number(e.target.value))}
                style={RAIL_INPUT}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={RAIL_LABEL}>Work ends</label>
              <select
                value={workEnd}
                onChange={(e) => setWorkEnd(Number(e.target.value))}
                style={RAIL_INPUT}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h + 1}>
                    {((h + 1) % 24).toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={RAIL_LABEL}>Work days</label>
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
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={RAIL_LABEL}>Wakes up</label>
              <select
                value={wakeStart}
                onChange={(e) => setWakeStart(Number(e.target.value))}
                style={RAIL_INPUT}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={RAIL_LABEL}>Sleeps at</label>
              <select
                value={wakeEnd}
                onChange={(e) => setWakeEnd(Number(e.target.value))}
                style={RAIL_INPUT}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h + 1}>
                    {((h + 1) % 24).toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={RAIL_LABEL}>Relationship (optional)</label>
            <input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              style={RAIL_INPUT}
              placeholder="mom, partner, best friend"
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#3d2410",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            <span>★ Pin</span>
          </label>
        </>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          type="submit"
          disabled={!name.trim() || !selected}
          style={{
            padding: "6px 14px",
            background: "#3d2410",
            color: "#faf3e0",
            border: "none",
            borderRadius: 2,
            cursor: "pointer",
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: !name.trim() || !selected ? 0.4 : 1,
          }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "6px 14px",
            background: "transparent",
            color: "#3d2410",
            border: "1px solid #c9a872",
            borderRadius: 2,
            cursor: "pointer",
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
