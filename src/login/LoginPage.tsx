import LoginForm from "./LoginForm";
import WireGlobe from "../components/WireGlobe";

const COLORS = {
  ink: "#1c1410",
  brass: "#7a5a30",
  parchment: "#ede0c0",
  ruleLight: "rgba(184, 134, 42, 0.55)",
};

const SERIF = "ui-serif, Georgia, serif";

type Props = {
  onSkip: () => void;
};

export default function LoginPage({ onSkip }: Props) {
  return (
    <div
      style={{
        height: "100vh",
        background: COLORS.parchment,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 48,
      }}
    >
      <div style={{ color: COLORS.ink }}>
        <WireGlobe size={140} strokeWidth={1.5} duration={18} />
      </div>

      <div
        style={{
          fontFamily: SERIF,
          fontSize: 56,
          letterSpacing: 7,
          textTransform: "lowercase",
          color: COLORS.ink,
          lineHeight: 1,
        }}
      >
        pangea
      </div>

      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 15,
          color: COLORS.brass,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 320,
        }}
      >
        a quiet way to find your people across time.
      </div>

      <div style={{ width: 120, height: 1, background: COLORS.ruleLight }} />

      <div style={{ width: 360 }}>
        <LoginForm />
      </div>

      <button
        onClick={onSkip}
        style={{
          marginTop: 4,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: COLORS.brass,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 13,
          textDecoration: "underline",
          textDecorationColor: "rgba(122, 90, 48, 0.4)",
          textUnderlineOffset: 4,
        }}
      >
        or, just take a look →
      </button>
    </div>
  );
}
