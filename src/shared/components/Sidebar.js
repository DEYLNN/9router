"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { APP_CONFIG, UPDATER_CONFIG } from "@/shared/constants/config";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import Button from "./Button";
import { ConfirmModal } from "./Modal";

// ─── inline SVG icons ────────────────────────────────────────────────────────
const IcoEndpoint = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IcoProviders = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/><circle cx="18" cy="5.5" r="1" fill="currentColor"/><circle cx="18" cy="12.5" r="1" fill="currentColor"/><circle cx="18" cy="19.5" r="1" fill="currentColor"/></svg>;
const IcoCombos = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
const IcoUsage = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
const IcoQuota = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IcoTerminal = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
const IcoTranslate = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14M5 8a2 2 0 010-4h14a2 2 0 010 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12"/></svg>;
const IcoSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const IcoShutdown = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10"/></svg>;
const IcoUpdate = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/></svg>;
const IcoLogo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>;

const ICON_MAP = {
  api: IcoEndpoint,
  dns: IcoProviders,
  layers: IcoCombos,
  bar_chart: IcoUsage,
  data_usage: IcoQuota,
  terminal: IcoTerminal,
  translate: IcoTranslate,
  settings: IcoSettings,
};

const navItems = [
  { href: "/dashboard/endpoint", label: "Endpoint", icon: "api" },
  { href: "/dashboard/providers", label: "Providers", icon: "dns" },
  { href: "/dashboard/combos", label: "Combos", icon: "layers" },
  { href: "/dashboard/usage", label: "Usage", icon: "bar_chart" },
  { href: "/dashboard/quota", label: "Quota Tracker", icon: "data_usage" },
];

const debugItems = [
  { href: "/dashboard/console-log", label: "Console Log", icon: "terminal" },
  { href: "/dashboard/translator", label: "Translator", icon: "translate" },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shutdownCountdown, setShutdownCountdown] = useState(0);
  const [enableTranslator, setEnableTranslator] = useState(false);
  const { copied, copy } = useCopyToClipboard(2000);

  const INSTALL_CMD = UPDATER_CONFIG.installCmdLatest;

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => { if (data.enableTranslator) setEnableTranslator(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/version")
      .then(res => res.json())
      .then(data => { if (data.hasUpdate) setUpdateInfo(data); })
      .catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === "/dashboard/endpoint") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/endpoint");
    }
    return pathname.startsWith(href);
  };

  const handleUpdate = () => { setShowUpdateModal(false); setIsUpdating(true); };

  const handleCopyAndShutdown = async () => {
    try { await navigator.clipboard.writeText(INSTALL_CMD); } catch { }
    copy(INSTALL_CMD);
    let remaining = UPDATER_CONFIG.shutdownCountdownSec;
    setShutdownCountdown(remaining);
    const timer = setInterval(() => {
      remaining -= 1;
      setShutdownCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        fetch("/api/version/shutdown", { method: "POST" }).catch(() => {});
        setIsDisconnected(true);
      }
    }, 1000);
  };

  const handleCancelUpdate = () => { setIsUpdating(false); setShutdownCountdown(0); };

  const handleShutdown = async () => {
    setIsShuttingDown(true);
    try { await fetch("/api/shutdown", { method: "POST" }); } catch { }
    setIsShuttingDown(false);
    setShowShutdownModal(false);
    setIsDisconnected(true);
  };

  const NavItem = ({ href, label, icon }) => {
    const active = isActive(href);
    const Icon = ICON_MAP[icon] || IcoEndpoint;
    return (
      <Link
        href={href}
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 10px",
          height: "36px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 500,
          textDecoration: "none",
          transition: "background 150ms ease, color 150ms ease",
          borderLeft: active ? "2px solid var(--color-primary)" : "2px solid transparent",
          background: active ? "rgba(59,130,246,0.08)" : "transparent",
          color: active ? "var(--color-primary)" : "var(--color-text-muted)",
          marginBottom: "2px",
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--color-surface-2)"; e.currentTarget.style.color = "var(--color-text-main)"; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; } }}
      >
        <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}><Icon /></span>
        {label}
      </Link>
    );
  };

  return (
    <>
      <aside style={{
        display: "flex",
        flexDirection: "column",
        width: "240px",
        minHeight: "100%",
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "8px",
              background: "var(--color-primary)",
              color: "#fff", flexShrink: 0,
            }}>
              <IcoLogo />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-main)", letterSpacing: "-0.02em" }}>
                {APP_CONFIG.name}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-subtle)" }}>v{APP_CONFIG.version}</div>
            </div>
          </Link>

          {updateInfo && (
            <div style={{ marginTop: "10px", padding: "8px", borderRadius: "8px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#F59E0B", marginBottom: "6px" }}>
                Update available: v{updateInfo.latestVersion}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setShowUpdateModal(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    padding: "4px 8px", borderRadius: "6px",
                    background: "#F59E0B", border: "none",
                    color: "#000", fontSize: "11px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <IcoUpdate /> Update
                </button>
                <button
                  onClick={() => copy(INSTALL_CMD)}
                  style={{ background: "none", border: "none", cursor: "pointer", flex: 1, textAlign: "left", overflow: "hidden" }}
                >
                  <code style={{ fontSize: "10px", color: "rgba(245,158,11,0.7)", fontFamily: "monospace", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {copied ? "✓ copied!" : INSTALL_CMD}
                  </code>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {navItems.map(item => <NavItem key={item.href} {...item} />)}

          {/* System section */}
          <div style={{ marginTop: "16px", marginBottom: "6px", padding: "0 10px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              System
            </span>
          </div>

          {debugItems.map(item => {
            const show = item.href !== "/dashboard/translator" || enableTranslator;
            return show ? <NavItem key={item.href} {...item} /> : null;
          })}

          <NavItem href="/dashboard/profile" label="Settings" icon="settings" />
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--color-border)" }}>
          <button
            onClick={() => setShowShutdownModal(true)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              width: "100%", padding: "8px 12px", borderRadius: "8px",
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", fontSize: "13px", fontWeight: 500,
              cursor: "pointer", transition: "background 150ms ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <IcoShutdown /> Shutdown
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showShutdownModal}
        onClose={() => setShowShutdownModal(false)}
        onConfirm={handleShutdown}
        title="Close Proxy"
        message="Are you sure you want to close the proxy server?"
        confirmText="Close"
        cancelText="Cancel"
        variant="danger"
        loading={isShuttingDown}
      />

      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleUpdate}
        title="Update 9Router"
        message={`Show install command for v${updateInfo?.latestVersion || ""}? You can copy it and shutdown to install manually.`}
        confirmText="Show Command"
        cancelText="Cancel"
        variant="primary"
      />

      {(isDisconnected || isUpdating) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", padding: "24px" }}>
          {isUpdating ? (
            <ManualUpdatePanel
              latestVersion={updateInfo?.latestVersion}
              installCmd={INSTALL_CMD}
              copied={copied}
              onCopyAndShutdown={handleCopyAndShutdown}
              onCancel={handleCancelUpdate}
              countdown={shutdownCountdown}
              isDisconnected={isDisconnected}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "32px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#ef4444" }}>
                <IcoShutdown />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Server Disconnected</h2>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>The proxy server has been stopped.</p>
              <Button variant="secondary" onClick={() => globalThis.location.reload()}>Reload Page</Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

Sidebar.propTypes = { onClose: PropTypes.func };

function ManualUpdatePanel({ latestVersion, installCmd, copied, onCopyAndShutdown, onCancel, countdown, isDisconnected }) {
  const isCountingDown = countdown > 0;
  return (
    <div style={{ width: "100%", maxWidth: "480px", borderRadius: "12px", background: "rgba(22,22,22,0.98)", border: "1px solid var(--color-border)", padding: "24px", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B", flexShrink: 0 }}>
          <IcoUpdate />
        </div>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "2px" }}>Update 9Router{latestVersion ? ` to v${latestVersion}` : ""}</h2>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            {isDisconnected ? "Server stopped. Paste the command into a terminal." : isCountingDown ? `Shutting down in ${countdown}s...` : "Copy the install command and shutdown to update."}
          </p>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px" }}>
        <code style={{ fontSize: "12px", fontFamily: "monospace", color: "#F59E0B", wordBreak: "break-all" }}>{installCmd}</code>
      </div>
      <ol style={{ fontSize: "12px", color: "var(--color-text-muted)", paddingLeft: "16px", marginBottom: "16px", lineHeight: 1.8 }}>
        <li>Click <strong style={{ color: "#fff" }}>Copy & Shutdown</strong> below.</li>
        <li>Paste the command into your terminal and press Enter.</li>
        <li>Run <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 4px", borderRadius: "3px", color: "#10B981" }}>9router</code> again after install.</li>
      </ol>
      {isDisconnected ? (
        <Button variant="secondary" fullWidth onClick={() => globalThis.location.reload()}>Reload Page</Button>
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={onCancel} disabled={isCountingDown}>Cancel</Button>
          <Button variant="primary" fullWidth onClick={onCopyAndShutdown} disabled={isCountingDown}>
            {copied ? "✓ Copied — shutting down..." : isCountingDown ? `Shutting down in ${countdown}s` : "Copy & Shutdown"}
          </Button>
        </div>
      )}
    </div>
  );
}

ManualUpdatePanel.propTypes = {
  latestVersion: PropTypes.string,
  installCmd: PropTypes.string.isRequired,
  copied: PropTypes.bool,
  onCopyAndShutdown: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  countdown: PropTypes.number,
  isDisconnected: PropTypes.bool,
};
