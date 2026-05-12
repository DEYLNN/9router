"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── icons ────────────────────────────────────────────────────────────────────
const IcoLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
  </svg>
);
const IcoLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          <span style={{ fontSize: "13px", color: "#71717A" }}>Initializing...</span>
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
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* dot grid */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
      {/* radial glow */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: "600px", height: "400px", pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "380px" }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px", gap: "12px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            boxShadow: "0 0 0 1px rgba(59,130,246,0.3), 0 8px 32px rgba(59,130,246,0.2)",
          }}>
            <IcoLogo />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#FAFAFA", letterSpacing: "-0.03em", margin: 0 }}>
              9Router
            </h1>
            <p style={{ fontSize: "13px", color: "#71717A", marginTop: "4px" }}>
              AI Gateway Platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "28px",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.02), 0 32px 64px rgba(0,0,0,0.6)",
        }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#FAFAFA", marginBottom: "4px" }}>
                Sign in
              </p>
              <p style={{ fontSize: "13px", color: "#71717A" }}>
                Enter your password to continue
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#A1A1AA", letterSpacing: "0.02em" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                  color: focused ? "#3B82F6" : "#52525B",
                  display: "flex", pointerEvents: "none",
                  transition: "color 150ms ease",
                }}>
                  <IcoLock />
                </span>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  autoFocus
                  style={{
                    width: "100%", boxSizing: "border-box",
                    height: "42px",
                    paddingLeft: "38px", paddingRight: "14px",
                    borderRadius: "8px",
                    border: error ? "1px solid rgba(239,68,68,0.5)" : focused ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    background: "#18181B",
                    color: "#FAFAFA",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 150ms ease",
                  }}
                />
              </div>
              {error && (
                <p style={{ fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                height: "42px", borderRadius: "8px",
                background: loading || !password ? "rgba(59,130,246,0.4)" : "#3B82F6",
                border: "none",
                color: "#fff",
                fontSize: "14px", fontWeight: 600,
                cursor: loading || !password ? "not-allowed" : "pointer",
                transition: "background 150ms ease, transform 100ms ease",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { if (!loading && password) e.currentTarget.style.background = "#2563EB"; }}
              onMouseLeave={e => { if (!loading && password) e.currentTarget.style.background = "#3B82F6"; }}
              onMouseDown={e => { if (!loading && password) e.currentTarget.style.transform = "scale(0.99)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? <IcoSpinner /> : <IcoArrow />}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {!hasPassword && (
              <p style={{ fontSize: "12px", textAlign: "center", color: "#52525B" }}>
                Default password:{" "}
                <code style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px", color: "#A1A1AA", fontFamily: "monospace" }}>
                  123456
                </code>
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "#3F3F46", marginTop: "24px" }}>
          AI Gateway · Secure Access
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #3F3F46; }
      `}</style>
    </div>
  );
}
