import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  align?: "center" | "left";
};

export default function LoginForm({ align = "center" }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ta = align === "left" ? "left" : ("center" as const);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ textAlign: ta, color: "#3d2410", fontFamily: "ui-serif, Georgia, serif" }}>
        <div style={{ fontSize: 16, lineHeight: 1.5 }}>
          A magic link is sailing to <em>{email}</em>.
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#7a5a30",
            marginTop: 12,
          }}
        >
          Check your inbox.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      <button
        onClick={handleGoogle}
        disabled={busy}
        style={{
          width: "100%",
          padding: "12px 18px",
          background: "#3d2410",
          opacity: busy ? 0.6 : 1,
          color: "#faf3e0",
          border: "none",
          borderRadius: 2,
          cursor: "pointer",
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 13,
          letterSpacing: 3,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "1px solid #faf3e0",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          G
        </span>
        Continue with Google
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#7a5a30",
          fontSize: 10,
          letterSpacing: 3,
          textTransform: "uppercase",
          fontFamily: "ui-serif, Georgia, serif",
        }}
      >
        <span style={{ flex: 1, height: 1, background: "rgba(122, 90, 48, 0.4)" }} />
        or
        <span style={{ flex: 1, height: 1, background: "rgba(122, 90, 48, 0.4)" }} />
      </div>

      <form
        onSubmit={handleSendLink}
        style={{ display: "flex", gap: 8, alignItems: "stretch" }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@somewhere.com"
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "#faf3e0",
            border: "1px solid #c9a872",
            borderRadius: 2,
            color: "#1c1410",
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          aria-label="Send magic link"
          disabled={busy}
          style={{
            width: 44,
            background: "transparent",
            border: "1px solid #c9a872",
            borderRadius: 2,
            cursor: "pointer",
            color: "#3d2410",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: busy ? 0.6 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="-12 -12 24 24" aria-hidden="true">
            <path
              d="M -8,0 L 8,0 M 4,-4 L 8,0 L 4,4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>

      <div
        style={{
          textAlign: ta,
          fontSize: 10,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "#a98448",
          fontFamily: "ui-serif, Georgia, serif",
          marginTop: 6,
        }}
      >
        no passwords · ever
      </div>

      {error && (
        <div
          style={{
            textAlign: ta,
            fontSize: 12,
            color: "#7a4218",
            fontFamily: "ui-serif, Georgia, serif",
            fontStyle: "italic",
            marginTop: 4,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
