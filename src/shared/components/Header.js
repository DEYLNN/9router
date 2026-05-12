"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import ProviderIcon from "@/shared/components/ProviderIcon";
import HeaderMenu from "@/shared/components/HeaderMenu";
import ThemeToggle from "@/shared/components/ThemeToggle";
import { useHeaderSearchStore } from "@/store/headerSearchStore";
import { OAUTH_PROVIDERS, APIKEY_PROVIDERS } from "@/shared/constants/config";
import { translate } from "@/i18n/runtime";

// ─── inline SVG icons ────────────────────────────────────────────────────────
const IcoMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m9 18 6-6-6-6"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IcoClose = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IcoEndpoint = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IcoProviders = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/><circle cx="18" cy="5.5" r="1" fill="currentColor"/><circle cx="18" cy="12.5" r="1" fill="currentColor"/><circle cx="18" cy="19.5" r="1" fill="currentColor"/></svg>;
const IcoCombos = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
const IcoUsage = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
const IcoQuota = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IcoSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const IcoTerminal = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
const IcoTranslate = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14M5 8a2 2 0 010-4h14a2 2 0 010 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12"/></svg>;
const IcoKey = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/></svg>;
const IcoMonitor = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;

const PAGE_ICON_MAP = {
  api: IcoEndpoint,
  dns: IcoProviders,
  layers: IcoCombos,
  bar_chart: IcoUsage,
  data_usage: IcoQuota,
  settings: IcoSettings,
  terminal: IcoTerminal,
  translate: IcoTranslate,
  vpn_key: IcoKey,
  monitor: IcoMonitor,
};

// ─── page info ────────────────────────────────────────────────────────────────
const getPageInfo = (pathname) => {
  if (!pathname) return { title: "", description: "", breadcrumbs: [] };

  const providerMatch = pathname.match(/\/providers\/([^/]+)$/);
  if (providerMatch) {
    const providerId = providerMatch[1];
    const providerInfo = OAUTH_PROVIDERS[providerId] || APIKEY_PROVIDERS[providerId];
    if (providerInfo) {
      return {
        title: providerInfo.name,
        description: "",
        breadcrumbs: [
          { label: "Providers", href: "/dashboard/providers" },
          { label: providerInfo.name, image: `/providers/${providerInfo.id}.png` },
        ],
      };
    }
  }

  if (pathname.includes("/providers")) return { title: "Providers", description: "Manage your AI provider connections", icon: "dns", breadcrumbs: [] };
  if (pathname.includes("/combos")) return { title: "Combos", description: "Model combos with fallback", icon: "layers", breadcrumbs: [] };
  if (pathname.includes("/usage")) return { title: "Usage & Analytics", description: "Monitor your API usage, token consumption, and request logs", icon: "bar_chart", breadcrumbs: [] };
  if (pathname.includes("/auth-files")) return { title: "Auth Files", description: "Map provider credentials stored in the local database", icon: "vpn_key", breadcrumbs: [] };
  if (pathname.includes("/quota")) return { title: "Quota Tracker", description: "Track and manage your API quota limits", icon: "data_usage", breadcrumbs: [] };
  if (pathname.includes("/endpoint")) return { title: "Endpoint", description: "API endpoint configuration", icon: "api", breadcrumbs: [] };
  if (pathname.includes("/profile")) return { title: "Settings", description: "Manage your preferences", icon: "settings", breadcrumbs: [] };
  if (pathname.includes("/translator")) return { title: "Translator", description: "Debug translation flow between formats", icon: "translate", breadcrumbs: [] };
  if (pathname.includes("/console-log")) return { title: "Console Log", description: "Live server console output", icon: "monitor", breadcrumbs: [] };
  if (pathname === "/dashboard") return { title: "Endpoint", description: "API endpoint configuration", icon: "api", breadcrumbs: [] };
  return { title: "", description: "", breadcrumbs: [] };
};

// ─── header ───────────────────────────────────────────────────────────────────
export default function Header({ onMenuClick, showMenuButton = true }) {
  const pathname = usePathname();
  const router = useRouter();
  const pageInfo = useMemo(() => getPageInfo(pathname), [pathname]);
  const { title, description, icon, breadcrumbs } = pageInfo;

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) { router.push("/login"); router.refresh(); }
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const PageIcon = icon ? (PAGE_ICON_MAP[icon] || null) : null;

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      height: "52px",
      padding: "0 20px",
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      flexShrink: 0,
      zIndex: 20,
    }}>
      {/* Left: mobile menu + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
        {/* Mobile menu button */}
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="lg:hidden"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px", borderRadius: "8px",
              background: "transparent", border: "none",
              color: "var(--color-text-muted)", cursor: "pointer",
              flexShrink: 0,
              transition: "color 150ms ease",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--color-text-main)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
          >
            <IcoMenu />
          </button>
        )}

        {/* Breadcrumbs or title */}
        {breadcrumbs.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
            {breadcrumbs.map((crumb, index) => (
              <div key={`${crumb.label}-${crumb.href || "current"}`} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {index > 0 && <span style={{ color: "var(--color-text-subtle)", opacity: 0.5 }}><IcoChevronRight /></span>}
                {crumb.href ? (
                  <Link href={crumb.href} style={{ fontSize: "14px", color: "var(--color-text-muted)", textDecoration: "none", transition: "color 150ms ease" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {crumb.image && (
                      <ProviderIcon src={crumb.image} alt={crumb.label} size={24}
                        className="object-contain rounded"
                        fallbackText={crumb.label.slice(0, 2).toUpperCase()}
                      />
                    )}
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-main)", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {translate(crumb.label)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : title ? (
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {PageIcon && (
                <span style={{ color: "var(--color-primary)", opacity: 0.8, flexShrink: 0 }}>
                  <PageIcon />
                </span>
              )}
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-main)", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {translate(title)}
              </span>
              {description && (
                <span className="hidden lg:block" style={{ fontSize: "12px", color: "var(--color-text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  — {translate(description)}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Right: search + theme + menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
        <HeaderSearch />
        <ThemeToggle />
        <HeaderMenu onLogout={handleLogout} />
      </div>
    </header>
  );
}

// ─── header search ────────────────────────────────────────────────────────────
function HeaderSearch() {
  const visible = useHeaderSearchStore((s) => s.visible);
  const query = useHeaderSearchStore((s) => s.query);
  const placeholder = useHeaderSearchStore((s) => s.placeholder);
  const setQuery = useHeaderSearchStore((s) => s.setQuery);

  if (!visible) return null;

  return (
    <div style={{ position: "relative", width: "160px" }} className="sm:w-[200px]">
      <span style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-subtle)", pointerEvents: "none", display: "flex" }}>
        <IcoSearch />
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          height: "32px", paddingLeft: "28px", paddingRight: query ? "28px" : "10px",
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
          color: "var(--color-text-main)",
          fontSize: "13px", outline: "none",
          transition: "border-color 150ms ease",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
        onBlur={e => e.target.style.borderColor = "var(--color-border)"}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          style={{
            position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-text-subtle)", display: "flex", padding: "2px",
          }}
        >
          <IcoClose />
        </button>
      )}
    </div>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func,
  showMenuButton: PropTypes.bool,
};
