import { useCallback, useEffect, useMemo, useState } from "react";
import Splash from "./components/Splash";
import WireGlobe from "./components/WireGlobe";
import Globe, { type PinDatum } from "./globe/Globe";
import WorkRail from "./rail/WorkRail";
import PersonalRail from "./rail/PersonalRail";
import { useStore, type Circle, type Person } from "./data/store";
import { useAuth } from "./data/useAuth";
import { usePreferences } from "./data/usePreferences";
import { isPersonAwake, isPersonWorking } from "./lib/overlap";
import { CITIES } from "./lib/cities";
import LoginPage from "./login/LoginPage";

const TABS: { id: Circle; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "work", label: "Work" },
];

function getSelfCity() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return CITIES.find((c) => c.timezone === tz) ?? CITIES.find((c) => c.name === "San Francisco")!;
}

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [tab, setTab] = useState<Circle>("personal");
  const [now, setNow] = useState(() => new Date());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const { store, addPerson, updatePerson, removePerson, toggleFavorite } = useStore(user);
  const { pinColor, bodyPalette, setPinColor, setBodyPalette } = usePreferences(user);

  const handleSelectPerson = useCallback(
    (id: string) => {
      const tabPeople = store[tab];
      const found = tabPeople.find((p) => p.id === id);
      if (found) setFlyTo({ lat: found.lat, lng: found.lng });
    },
    [store, tab],
  );

  const handleClickPin = useCallback(
    (id: string) => {
      handleSelectPerson(id);
    },
    [handleSelectPerson],
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleSplashDone = useCallback(() => setLoading(false), []);

  const selfCity = useMemo(getSelfCity, []);
  const selfPerson: Person = useMemo(
    () => ({
      id: "__self__",
      name: "You",
      cityName: selfCity.name,
      countryCode: selfCity.countryCode,
      timezone: selfCity.timezone,
      lat: selfCity.lat,
      lng: selfCity.lng,
      workStart: 9,
      workEnd: 17,
      workDays: [1, 2, 3, 4, 5],
    }),
    [selfCity],
  );

  const people = store[tab];

  const pins: PinDatum[] = useMemo(() => {
    return people.map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      timezone: p.timezone,
      active: tab === "work" ? isPersonWorking(p, now) : isPersonAwake(p, now),
      favorite: tab === "personal" ? !!p.favorite : false,
    }));
  }, [people, now, tab]);

  const workPeopleWithSelf = useMemo(
    () => [selfPerson, ...store.work],
    [selfPerson, store.work],
  );

  // While auth state is loading on first paint, keep splash alive
  if (authLoading) {
    return <Splash onDone={handleSplashDone} durationMs={1000000} />;
  }

  // Not authenticated and not guest — show login
  if (!user && !guestMode) {
    return <LoginPage onSkip={() => setGuestMode(true)} />;
  }

  // Once we entered the app, signing out (or losing user) should send back to login
  if (!user && guestMode === false) {
    return <LoginPage onSkip={() => setGuestMode(true)} />;
  }

  return (
    <>
      {loading && <Splash onDone={handleSplashDone} />}
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#ede0c0",
          color: "#1c1410",
        }}
      >
        <header
          style={{
            height: 64,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(169, 132, 72, 0.3)",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <WireGlobe size={28} strokeWidth={1.5} duration={14} />
            <span
              style={{
                fontFamily: "ui-serif, Georgia, serif",
                fontSize: 18,
                letterSpacing: 6,
                textTransform: "lowercase",
              }}
            >
              pangea
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <nav style={{ display: "flex", gap: 4 }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setHoveredId(null);
                  }}
                  style={{
                    padding: "6px 18px",
                    borderRadius: 2,
                    border: "none",
                    background: tab === t.id ? "#3d2410" : "transparent",
                    color: tab === t.id ? "#faf3e0" : "#7a5a30",
                    fontFamily: "ui-serif, Georgia, serif",
                    fontSize: 13,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "background 120ms, color 120ms",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            {user ? (
              <button
                onClick={async () => {
                  await signOut();
                  setGuestMode(false);
                }}
                title={user.email ?? "signed in"}
                style={{
                  padding: "6px 14px",
                  borderRadius: 2,
                  border: "1px solid rgba(169, 132, 72, 0.4)",
                  background: "transparent",
                  color: "#7a5a30",
                  fontFamily: "ui-serif, Georgia, serif",
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                sign out
              </button>
            ) : (
              <button
                onClick={() => setGuestMode(false)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 2,
                  border: "1px solid rgba(169, 132, 72, 0.4)",
                  background: "transparent",
                  color: "#7a5a30",
                  fontFamily: "ui-serif, Georgia, serif",
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                sign in to sync
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Globe
              pins={pins}
              hoveredId={hoveredId}
              onHoverPin={setHoveredId}
              now={now}
              userLat={selfCity.lat}
              userLng={selfCity.lng}
              flyTo={flyTo}
              onClickPin={handleClickPin}
              pinColorId={pinColor}
              bodyPaletteId={bodyPalette}
              onPinColorChange={setPinColor}
              onBodyPaletteChange={setBodyPalette}
            />
          </div>
          {tab === "work" ? (
            <WorkRail
              people={people}
              peopleForBestMeeting={workPeopleWithSelf}
              now={now}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onSelect={handleSelectPerson}
              onAdd={(p) => addPerson("work", p)}
              onUpdate={(id, patch) => updatePerson("work", id, patch)}
              onRemove={(id) => removePerson("work", id)}
            />
          ) : (
            <PersonalRail
              people={people}
              now={now}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onSelect={handleSelectPerson}
              onAdd={(p) => addPerson("personal", p)}
              onUpdate={(id, patch) => updatePerson("personal", id, patch)}
              onRemove={(id) => removePerson("personal", id)}
              onToggleFavorite={(id) => toggleFavorite("personal", id)}
            />
          )}
        </main>
      </div>
    </>
  );
}
