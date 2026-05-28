import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { latLngToVec3, sunDirection } from "./utils";
import { hasWebGL } from "./webgl";
import { buildLandGeometry } from "./land";

export type PinDatum = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  timezone: string;
  active: boolean;
  favorite?: boolean;
};

const PIN_COLORS = [
  { id: "marigold", name: "Marigold", value: "#fcc83a" },
  { id: "amber", name: "Amber", value: "#f5b840" },
  { id: "honey", name: "Honey", value: "#f0c060" },
  { id: "bright", name: "Bright gold", value: "#ffd266" },
  { id: "soft", name: "Soft gold", value: "#ffdf8a" },
];

type BodyPalette = {
  id: string;
  name: string;
  body: string;
  emissive: string;
};

const BODY_PALETTES: BodyPalette[] = [
  { id: "sage", name: "Sage", body: "#b8c890", emissive: "#7c8a58" },
  { id: "lichen", name: "Lichen", body: "#98b074", emissive: "#60783c" },
  { id: "mint", name: "Mint", body: "#98c8b0", emissive: "#5e8e76" },
  { id: "sky", name: "Sky", body: "#a0bcd8", emissive: "#5a7a98" },
  { id: "periwinkle", name: "Periwinkle", body: "#a8b0e0", emissive: "#646aa0" },
  { id: "slate", name: "Slate", body: "#b4c0c8", emissive: "#74848c" },
  { id: "cream", name: "Cream wheat", body: "#d8b078", emissive: "#967438" },
];

const COLOR = {
  canvasBg: "#ede0c0",
  wire: "#3d2410",
  continent: "#1a0e05",
  pinInactive: "#3e2410",
  pinHover: "#ffffff",
  ambient: "#5a3e1a",
  sun: "#fff2d0",
};

function GlobeBody({ palette }: { palette: BodyPalette }) {
  return (
    <mesh>
      <sphereGeometry args={[1, 128, 128]} />
      <meshStandardMaterial
        color={palette.body}
        emissive={palette.emissive}
        emissiveIntensity={0.45}
        roughness={0.65}
        metalness={0.35}
      />
    </mesh>
  );
}

function buildMeridianGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  for (let lng = -180; lng < 180; lng += 30) {
    for (let lat = -90; lat < 90; lat += 2) {
      const a = latLngToVec3(lat, lng, 1.003);
      const b = latLngToVec3(lat + 2, lng, 1.003);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geom;
}

function buildParallelGeometry(emphasis: boolean): THREE.BufferGeometry {
  const positions: number[] = [];
  const lats = emphasis ? [0] : [-75, -60, -45, -30, -15, 15, 30, 45, 60, 75];
  for (const lat of lats) {
    for (let lng = -180; lng < 180; lng += 2) {
      const a = latLngToVec3(lat, lng, 1.003);
      const b = latLngToVec3(lat, lng + 2, 1.003);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geom;
}

function Graticule() {
  const meridianGeom = useMemo(buildMeridianGeometry, []);
  const parallelGeom = useMemo(() => buildParallelGeometry(false), []);
  const equatorGeom = useMemo(() => buildParallelGeometry(true), []);
  return (
    <group>
      <lineSegments geometry={meridianGeom}>
        <lineBasicMaterial color={COLOR.wire} transparent opacity={0.5} />
      </lineSegments>
      <lineSegments geometry={parallelGeom}>
        <lineBasicMaterial color={COLOR.wire} transparent opacity={0.5} />
      </lineSegments>
      <lineSegments geometry={equatorGeom}>
        <lineBasicMaterial color={COLOR.wire} transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}

function Continents() {
  const geom = useMemo(buildLandGeometry, []);
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color={COLOR.continent} transparent opacity={0.95} />
    </lineSegments>
  );
}

function Pin({
  pin,
  hovered,
  activeColor,
  onHover,
  onUnhover,
  onClick,
}: {
  pin: PinDatum;
  hovered: boolean;
  activeColor: string;
  onHover: (id: string) => void;
  onUnhover: (id: string) => void;
  onClick: (id: string) => void;
}) {
  const pos = useMemo(() => latLngToVec3(pin.lat, pin.lng, 1.018), [pin.lat, pin.lng]);
  const haloRef = useRef<THREE.Mesh>(null);

  const isFav = !!pin.favorite;
  const isActive = pin.active;

  const baseRadius = isFav ? 0.022 : 0.014;
  const haloRadius = baseRadius * 2;

  const outerColor = hovered
    ? COLOR.pinHover
    : isActive
      ? activeColor
      : COLOR.pinInactive;

  useFrame(({ clock }) => {
    if (!haloRef.current) return;
    const t = clock.getElapsedTime();
    if (isActive) {
      const amp = isFav ? 0.45 : 0.35;
      const s = 1 + amp * Math.sin(t * 1.6 + pin.lat);
      haloRef.current.scale.setScalar(s);
      const baseOp = isFav ? 0.32 : 0.2;
      const ampOp = isFav ? 0.2 : 0.14;
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity =
        baseOp + ampOp * Math.sin(t * 1.6 + pin.lat);
    } else {
      haloRef.current.scale.setScalar(1);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06;
    }
  });

  return (
    <group
      position={pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(pin.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onUnhover(pin.id);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(pin.id);
      }}
    >
      <mesh ref={haloRef}>
        <sphereGeometry args={[haloRadius, 16, 16]} />
        <meshBasicMaterial color={outerColor} transparent opacity={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[baseRadius, 20, 20]} />
        <meshBasicMaterial color={outerColor} />
      </mesh>

      {hovered && (
        <mesh>
          <ringGeometry args={[baseRadius * 1.6, baseRadius * 2.0, 32]} />
          <meshBasicMaterial color={outerColor} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Sun({ pos }: { pos: THREE.Vector3 }) {
  return (
    <directionalLight
      position={[pos.x, pos.y, pos.z]}
      intensity={1.6}
      color={COLOR.sun}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ControlsRef = any;

function FlyTo({
  target,
  controlsRef,
  onArrived,
}: {
  target: { lat: number; lng: number } | null;
  controlsRef: React.MutableRefObject<ControlsRef>;
  onArrived: () => void;
}) {
  useFrame(() => {
    if (!target || !controlsRef.current) return;
    const ctrl = controlsRef.current;
    const t = latLngToVec3(target.lat, target.lng).normalize();
    let desiredAz = Math.atan2(t.x, t.z);
    let desiredPolar = Math.acos(Math.max(-1, Math.min(1, t.y)));
    desiredPolar = Math.max(0.4, Math.min(Math.PI - 0.4, desiredPolar));

    const az = ctrl.getAzimuthalAngle();
    const pol = ctrl.getPolarAngle();

    let dAz = desiredAz - az;
    while (dAz > Math.PI) dAz -= 2 * Math.PI;
    while (dAz < -Math.PI) dAz += 2 * Math.PI;
    const dPol = desiredPolar - pol;

    const newAz = az + dAz * 0.09;
    const newPol = pol + dPol * 0.09;
    ctrl.setAzimuthalAngle(newAz);
    ctrl.setPolarAngle(newPol);

    if (Math.abs(dAz) < 0.01 && Math.abs(dPol) < 0.01) {
      onArrived();
    }
  });
  return null;
}

function WebGLFallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        padding: 24,
        textAlign: "center",
        color: "#3d2410",
        fontFamily: "ui-serif, Georgia, serif",
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: 2 }}>WebGL is disabled</div>
      <div style={{ fontSize: 14, maxWidth: 480, lineHeight: 1.5, color: "#7a5a30" }}>
        The globe needs hardware-accelerated graphics to render. In Chrome:
        Settings → System → turn on "Use graphics acceleration when available",
        then relaunch.
      </div>
    </div>
  );
}

function formatUTC(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function formatLocalTimeWithSeconds(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

function formatLocalDate(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

function localTzLabel(d: Date): string {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: "short",
  }).formatToParts(d);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        padding: "10px 16px",
        background: "rgba(245, 235, 215, 0.78)",
        border: "1px solid rgba(61, 36, 16, 0.25)",
        borderRadius: 2,
        color: "#3d2410",
        fontFamily: "ui-serif, Georgia, serif",
        backdropFilter: "blur(4px)",
        minWidth: 200,
      }}
    >
      <div style={{ fontSize: 22, lineHeight: 1.1, letterSpacing: 0.5 }}>
        {formatLocalTimeWithSeconds(now)}
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#7a5a30",
          marginTop: 4,
        }}
      >
        {localTzLabel(now)} · {formatLocalDate(now)}
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1,
          color: "#a98448",
          marginTop: 6,
          paddingTop: 6,
          borderTop: "1px solid rgba(169, 132, 72, 0.3)",
        }}
      >
        {formatUTC(now)} UTC
      </div>
    </div>
  );
}

function PointerMissedListener({ onMissed }: { onMissed: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const dom = gl.domElement;
    const handler = () => onMissed();
    dom.addEventListener("pointerdown", handler);
    return () => dom.removeEventListener("pointerdown", handler);
  }, [gl, onMissed]);
  return null;
}

type Props = {
  pins: PinDatum[];
  hoveredId: string | null;
  onHoverPin: (id: string | null) => void;
  now: Date;
  userLat: number;
  userLng: number;
  flyTo: { lat: number; lng: number } | null;
  onClickPin: (id: string) => void;
  pinColorId: string;
  bodyPaletteId: string;
  onPinColorChange: (id: string) => void;
  onBodyPaletteChange: (id: string) => void;
};

export default function Globe({
  pins,
  hoveredId,
  onHoverPin,
  now,
  userLat,
  userLng,
  flyTo,
  onClickPin,
  pinColorId,
  bodyPaletteId,
  onPinColorChange,
  onBodyPaletteChange,
}: Props) {
  const [webglAvailable] = useState(() => hasWebGL());
  const [focused, setFocused] = useState<{ lat: number; lng: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeColor =
    PIN_COLORS.find((c) => c.id === pinColorId)?.value ?? PIN_COLORS[0].value;
  const bodyPalette =
    BODY_PALETTES.find((p) => p.id === bodyPaletteId) ?? BODY_PALETTES[0];
  const sunPos = useMemo(() => sunDirection(now), [now]);
  const controlsRef = useRef<ControlsRef>(null);

  // External flyTo target (from row clicks) overrides internal focused state.
  useEffect(() => {
    if (flyTo) setFocused(flyTo);
  }, [flyTo]);

  if (!webglAvailable) return <WebGLFallback />;

  const resetView = () => {
    controlsRef.current?.reset();
    setFocused({ lat: userLat, lng: userLng });
  };

  const handleClickPin = (id: string) => {
    onClickPin(id);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [2.4, 1.0, 2.4], fov: 38, up: [0, 1, 0] }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[COLOR.canvasBg]} />

        <PointerMissedListener
          onMissed={() => {
            // a click on empty canvas cancels focus and clears hover
            // (pointerdown fires before pin's onClick stopPropagation, so use a microtask)
            queueMicrotask(() => {
              if (!hoveredId) onHoverPin(null);
            });
          }}
        />

        <ambientLight intensity={0.85} color={COLOR.ambient} />
        <Sun pos={sunPos} />
        <hemisphereLight intensity={0.45} color="#fff0d0" groundColor="#2a1808" />

        <GlobeBody palette={bodyPalette} />
        <Graticule />
        <Continents />
        {pins.map((p) => (
          <Pin
            key={p.id}
            pin={p}
            hovered={hoveredId === p.id}
            activeColor={activeColor}
            onHover={onHoverPin}
            onUnhover={(id) => {
              if (hoveredId === id) onHoverPin(null);
            }}
            onClick={handleClickPin}
          />
        ))}

        <FlyTo
          target={focused}
          controlsRef={controlsRef}
          onArrived={() => setFocused(null)}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1.6}
          maxDistance={6}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI - 0.35}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!focused}
          autoRotateSpeed={0.25}
          makeDefault
          onStart={() => {
            if (focused) setFocused(null);
          }}
        />
      </Canvas>

      <button
        onClick={resetView}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          padding: "6px 14px",
          background: "rgba(245, 235, 215, 0.7)",
          border: "1px solid rgba(61, 36, 16, 0.25)",
          borderRadius: 2,
          color: "#3d2410",
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
      >
        Reset view
      </button>

      <Clock />

      <button
        onClick={() => setSettingsOpen((o) => !o)}
        title="Settings"
        aria-label="Settings"
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: settingsOpen
            ? "rgba(61, 36, 16, 0.9)"
            : "rgba(245, 235, 215, 0.78)",
          border: "1px solid rgba(61, 36, 16, 0.25)",
          color: settingsOpen ? "#faf3e0" : "#3d2410",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          transition: "background 160ms, color 160ms",
        }}
      >
        <GearIcon />
      </button>

      {settingsOpen && (
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 16,
            width: 280,
            padding: 16,
            background: "rgba(245, 235, 215, 0.94)",
            border: "1px solid rgba(61, 36, 16, 0.25)",
            borderRadius: 2,
            backdropFilter: "blur(8px)",
            boxShadow: "0 12px 32px -10px rgba(61, 36, 16, 0.3)",
          }}
        >
          <SettingsSection title="Active pin color">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {PIN_COLORS.map((c) => {
                const active = c.id === pinColorId;
                return (
                  <button
                    key={c.id}
                    onClick={() => onPinColorChange(c.id)}
                    title={c.name}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "none",
                      background: c.value,
                      boxShadow: active
                        ? "0 0 0 2px #ede0c0, 0 0 0 3.5px #3d2410"
                        : "inset 0 0 0 1px rgba(61, 36, 16, 0.2)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                );
              })}
            </div>
          </SettingsSection>

          <SettingsSection title="Globe color">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {BODY_PALETTES.map((p) => {
                const active = p.id === bodyPaletteId;
                return (
                  <button
                    key={p.id}
                    onClick={() => onBodyPaletteChange(p.id)}
                    title={p.name}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "none",
                      background: p.body,
                      boxShadow: active
                        ? "0 0 0 2px #ede0c0, 0 0 0 3.5px #3d2410"
                        : "inset 0 0 0 1px rgba(61, 36, 16, 0.2)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                );
              })}
            </div>
          </SettingsSection>
        </div>
      )}
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 10,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          color: "#7a5a30",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="-12 -12 24 24" aria-hidden="true">
      <circle cx="0" cy="0" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={Math.cos(rad) * 6}
            y1={Math.sin(rad) * 6}
            x2={Math.cos(rad) * 9}
            y2={Math.sin(rad) * 9}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
