"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── icons ────────────────────────────────────────────────────────────────────
const IcoLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
  </svg>
);
const IcoLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcoSpinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
);

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(null);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      try {
        const res = await fetch(`${baseUrl}/api/settings`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data.requireLogin === false) { router.push("/dashboard"); router.refresh(); return; }
          setHasPassword(!!data.hasPassword);
        } else { setHasPassword(true); }
      } catch { clearTimeout(timeoutId); setHasPassword(true); }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { router.push("/dashboard"); router.refresh(); }
      else { const data = await res.json(); setError(data.error || "Invalid password"); }
    } catch { setError("An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  if (hasPassword === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090B" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <IcoSpinner />
          <span style={{ fontSize: "13px", color: "rgba(250,250,250,0.40)" }}>Initializing...</span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#09090B",
      padding: "clamp(12px, 4vw, 24px)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient editorial glow (Cuties/Mahiru inspired) */}
      <div
        aria-hidden="true"
        className="theme-ambient-bg"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          opacity: 1,
        }}
      />
      {/* soft dot grid with mask */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,251,236,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 80%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 80%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "clamp(18px, 3vw, 28px)" }}>

        {/* Brand block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "58px", height: "58px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, var(--theme-accent-teal) 0%, var(--theme-accent-blue) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            boxShadow:
              "0 0 0 1px rgba(255,251,236,0.08) inset, 0 12px 36px -8px rgba(17,166,166,0.55)",
          }}>
            <IcoLogo />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 className="theme-display" style={{ fontSize: "clamp(28px, 6vw, 34px)", margin: 0, color: "#FAFAFA" }}>
              9Router
            </h1>
            <p className="theme-mono" style={{ fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "6px", color: "rgba(250,250,250,0.45)" }}>
              AI Gateway · Editorial Console
            </p>
          </div>
        </div>

        {/* Glass card */}
        <div
          className="theme-glass-lg"
          style={{
            padding: "clamp(20px, 5vw, 32px)",
            width: "100%",
          }}
        >
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="theme-chip theme-chip--teal" style={{ alignSelf: "flex-start" }}>
                Secure access
              </span>
              <h2 className="theme-display" style={{ fontSize: "22px", color: "#FAFAFA", margin: 0, marginTop: "6px" }}>
                Welcome back
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(250,250,250,0.60)", margin: 0, lineHeight: 1.55 }}>
                Sign in to continue to your AI gateway dashboard.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="theme-mono" style={{ fontSize: "11px", color: "rgba(250,250,250,0.60)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: focused ? "var(--theme-accent-teal)" : "rgba(250,250,250,0.40)",
                  display: "flex", pointerEvents: "none",
                  transition: "color 150ms ease",
                }}>
                  <IcoLock />
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: "46px",
                    paddingLeft: "40px",
                    paddingRight: "14px",
                    borderRadius: "12px",
                    border: error
                      ? "1px solid rgba(239,68,68,0.55)"
                      : focused
                        ? "1px solid rgba(17,166,166,0.55)"
                        : "1px solid rgba(255,251,236,0.12)",
                    background: "rgba(9,9,11,0.45)",
                    color: "#FAFAFA",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                    boxShadow: focused
                      ? "0 0 0 4px rgba(17,166,166,0.10)"
                      : error
                        ? "0 0 0 4px rgba(239,68,68,0.08)"
                        : "none",
                  }}
                />
              </div>
              {error && (
                <p style={{ fontSize: "12px", color: "#F87171", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%",
                height: "48px",
                borderRadius: "14px",
                background: loading || !password
                  ? "linear-gradient(135deg, rgba(17,166,166,0.35), rgba(36,107,254,0.35))"
                  : "linear-gradient(135deg, var(--theme-accent-teal), var(--theme-accent-blue))",
                border: "none",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                cursor: loading || !password ? "not-allowed" : "pointer",
                transition: "transform 120ms ease, filter 120ms ease",
                boxShadow: "0 12px 32px -10px rgba(17,166,166,0.55)",
              }}
              onMouseEnter={e => { if (!loading && password) e.currentTarget.style.filter = "brightness(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
              onMouseDown={e => { if (!loading && password) e.currentTarget.style.transform = "scale(0.99)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? <IcoSpinner /> : <IcoArrow />}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {!hasPassword && (
              <div style={{
                fontSize: "12px",
                textAlign: "center",
                color: "rgba(250,250,250,0.50)",
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                alignItems: "center",
                flexWrap: "wrap",
              }}>
                Default password:
                <code className="theme-mono" style={{
                  background: "rgba(255,255,255,0.06)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  color: "rgba(250,250,250,0.85)",
                  fontSize: "12px",
                  border: "1px solid rgba(255,251,236,0.08)",
                }}>
                  123456
                </code>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,250,250,0.32)" }} className="theme-mono">
          <span>9router</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>secure access</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: "var(--theme-accent-teal)" }}>live</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(250, 250, 250, 0.30); }
      `}</style>
    </div>
  );
}
