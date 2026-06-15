import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
import { useIsMobile } from "./lib/useIsMobile";
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
  const isMobile = useIsMobile();
  const [railOpen, setRailOpen] = useState(false);
  const { store, addPerson, updatePerson, removePerson, toggleFavorite } = useStore(user);
  const { pinColor, bodyPalette, selfAvailability, setPinColor, setBodyPalette, setSelfAvailability } =
    usePreferences(user);

  const selfCity = useMemo(getSelfCity, []);

  const handleSelectPerson = useCallback(
    (id: string) => {
      if (id === "__self__") {
        setFlyTo({ lat: selfCity.lat, lng: selfCity.lng });
        return;
      }
      const tabPeople = store[tab];
      const found = tabPeople.find((p) => p.id === id);
      if (found) setFlyTo({ lat: found.lat, lng: found.lng });
    },
    [store, tab, selfCity],
  );

  const handleClickPin = useCallback(
    (id: string) => {
      handleSelectPerson(id);
    },
    [handleSelectPerson],
  );

  // On mobile, selecting someone from the sheet should drop it so the
  // globe's fly-to animation is visible.
  const handleSelectFromRail = useCallback(
    (id: string) => {
      handleSelectPerson(id);
      if (isMobile) setRailOpen(false);
    },
    [handleSelectPerson, isMobile],
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleSplashDone = useCallback(() => setLoading(false), []);

  const selfPerson: Person = useMemo(
    () => ({
      id: "__self__",
      name: "Me",
      cityName: selfCity.name,
      countryCode: selfCity.countryCode,
      timezone: selfCity.timezone,
      lat: selfCity.lat,
      lng: selfCity.lng,
      workStart: selfAvailability.workStart,
      workEnd: selfAvailability.workEnd,
      workDays: selfAvailability.workDays,
    }),
    [selfCity, selfAvailability],
  );

  const people = store[tab];

  const pins: PinDatum[] = useMemo(() => {
    const selfPin: PinDatum = {
      id: "__self__",
      name: "Me",
      lat: selfPerson.lat,
      lng: selfPerson.lng,
      timezone: selfPerson.timezone,
      active: tab === "work" ? isPersonWorking(selfPerson, now) : isPersonAwake(selfPerson, now),
      isSelf: true,
    };
    return [
      selfPin,
      ...people.map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        timezone: p.timezone,
        active: tab === "work" ? isPersonWorking(p, now) : isPersonAwake(p, now),
        favorite: tab === "personal" ? !!p.favorite : false,
      })),
    ];
  }, [people, now, tab, selfPerson]);

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

  const railEl =
    tab === "work" ? (
      <WorkRail
        people={people}
        peopleForBestMeeting={workPeopleWithSelf}
        now={now}
        hoveredId={hoveredId}
        selfCityName={selfCity.name}
        selfAvailability={selfAvailability}
        onSelfAvailabilityChange={setSelfAvailability}
        onHover={setHoveredId}
        onSelect={handleSelectFromRail}
        onAdd={(p) => addPerson("work", p)}
        onUpdate={(id, patch) => updatePerson("work", id, patch)}
        onRemove={(id) => removePerson("work", id)}
        mobile={isMobile}
      />
    ) : (
      <PersonalRail
        people={people}
        now={now}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        onSelect={handleSelectFromRail}
        onAdd={(p) => addPerson("personal", p)}
        onUpdate={(id, patch) => updatePerson("personal", id, patch)}
        onRemove={(id) => removePerson("personal", id)}
        onToggleFavorite={(id) => toggleFavorite("personal", id)}
        mobile={isMobile}
      />
    );

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
            padding: isMobile ? "0 14px" : "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
            <WireGlobe size={isMobile ? 24 : 28} strokeWidth={1.5} duration={14} />
            <span
              style={{
                fontFamily: "ui-serif, Georgia, serif",
                fontSize: isMobile ? 15 : 18,
                letterSpacing: isMobile ? 3 : 6,
                textTransform: "lowercase",
              }}
            >
              pangea
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
            <nav style={{ display: "flex", gap: isMobile ? 2 : 4 }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setHoveredId(null);
                  }}
                  style={{
                    padding: isMobile ? "5px 10px" : "6px 18px",
                    borderRadius: 2,
                    border: "none",
                    background: tab === t.id ? "#3d2410" : "transparent",
                    color: tab === t.id ? "#faf3e0" : "#7a5a30",
                    fontFamily: "ui-serif, Georgia, serif",
                    fontSize: isMobile ? 11 : 13,
                    letterSpacing: isMobile ? 1 : 2,
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
                  padding: isMobile ? "5px 9px" : "6px 14px",
                  borderRadius: 2,
                  border: "1px solid rgba(169, 132, 72, 0.4)",
                  background: "transparent",
                  color: "#7a5a30",
                  fontFamily: "ui-serif, Georgia, serif",
                  fontSize: isMobile ? 10 : 11,
                  letterSpacing: isMobile ? 1 : 2,
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
                  padding: isMobile ? "5px 9px" : "6px 14px",
                  borderRadius: 2,
                  border: "1px solid rgba(169, 132, 72, 0.4)",
                  background: "transparent",
                  color: "#7a5a30",
                  fontFamily: "ui-serif, Georgia, serif",
                  fontSize: isMobile ? 10 : 11,
                  letterSpacing: isMobile ? 1 : 2,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                sign in to sync
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
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
          {isMobile ? (
            <MobileSheet
              open={railOpen}
              onOpen={() => setRailOpen(true)}
              onClose={() => setRailOpen(false)}
              label={tab === "work" ? "team" : "people"}
              count={people.length}
            >
              {railEl}
            </MobileSheet>
          ) : (
            railEl
          )}
        </main>
      </div>
    </>
  );
}

function MobileSheet({
  open,
  onOpen,
  onClose,
  label,
  count,
  children,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  label: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <>
      {/* Floating opener — only when the sheet is down */}
      {!open && (
        <button
          onClick={onOpen}
          style={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 24px",
            background: "#3d2410",
            color: "#faf3e0",
            border: "none",
            borderRadius: 999,
            boxShadow: "0 6px 20px rgba(28, 20, 16, 0.35)",
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            cursor: "pointer",
            zIndex: 20,
          }}
        >
          {label} · {count}
          <span style={{ fontSize: 13, lineHeight: 1 }}>↑</span>
        </button>
      )}

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(28, 20, 16, 0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 240ms ease",
          zIndex: 25,
        }}
      />

      {/* The sheet itself */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "80%",
          display: "flex",
          flexDirection: "column",
          background: "#f5ebd6",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 -10px 36px rgba(28, 20, 16, 0.3)",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          zIndex: 30,
          overflow: "hidden",
        }}
      >
        {/* Grab bar + close */}
        <div
          onClick={onClose}
          style={{
            flexShrink: 0,
            position: "relative",
            padding: "12px 16px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(201, 168, 114, 0.4)",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#7a5a30",
              fontFamily: "ui-serif, Georgia, serif",
            }}
          >
            {label} · {count}
          </span>
          <span
            style={{
              position: "absolute",
              top: 6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 38,
              height: 4,
              borderRadius: 999,
              background: "rgba(122, 90, 48, 0.4)",
            }}
          />
          <span style={{ fontSize: 20, lineHeight: 1, color: "#7a5a30" }} aria-label="Close">
            ×
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>{children}</div>
      </div>
    </>
  );
}
