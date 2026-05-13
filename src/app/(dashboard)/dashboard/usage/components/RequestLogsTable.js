"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ProviderIcon from "@/shared/components/ProviderIcon";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat().format(n || 0);

function parseLogLine(line) {
  if (!line) return null;
  const parts = line.split(" | ");
  if (parts.length < 6) return null;
  const [timestamp, model, providerRaw, account, inputTokens, outputTokens, status] = parts;
  return {
    timestamp,
    model: model?.trim(),
    provider: providerRaw?.trim(),
    account: account?.trim(),
    inputTokens: parseInt(inputTokens) || 0,
    outputTokens: parseInt(outputTokens) || 0,
    status: status?.trim() || "ok",
  };
}

function relativeTime(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return str;
  const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function providerColor(provider) {
  const map = {
    CODEX: "#3B82F6", CX: "#3B82F6",
    KIRO: "#A855F7", KR: "#A855F7",
    CANOPYWAVE: "#10B981", CWV: "#10B981",
    OPENROUTER: "#F97316",
    GEMINI: "#4285F4",
    CLAUDE: "#D97757", CC: "#D97757",
    GITHUB: "#6B7280", GH: "#6B7280",
    MINIMAX: "#7C3AED",
  };
  return map[provider?.toUpperCase()] || "#6B7280";
}


function providerIconPath(provider) {
  const raw = (provider || "").toLowerCase();
  const map = {
    codex: "codex", cx: "codex",
    kiro: "kiro", kr: "kiro",
    canopywave: "canopywave", cwv: "canopywave",
    github: "github", gh: "github",
    "xiaomi-mimo-plan-sgp": "xiaomi-mimo-plan-sgp", mms: "xiaomi-mimo-plan-sgp", "mimo-sgp": "xiaomi-mimo-plan-sgp",
    "openai-compatible-chat-5b54ddd1-0b0e-4452-9056-7a5e232672f9": "xiaomi-mimo-plan-sgp",
    openai: "openai", anthropic: "anthropic", xai: "xai", minimax: "minimax", fireworks: "fireworks", cerebras: "cerebras", chutes: "chutes",
  };
  return `/providers/${map[raw] || raw}.png`;
}

function providerLabel(provider) {
  const raw = (provider || "").trim();
  const map = {
    "XIAOMI-MIMO-PLAN-SGP": "MIMO Plan SGP",
    "OPENAI-COMPATIBLE-CHAT-5B54DDD1-0B0E-4452-9056-7A5E232672F9": "MimoSubs",
    CODEX: "Codex",
    KIRO: "Kiro",
    CANOPYWAVE: "CanopyWave",
  };
  return map[raw.toUpperCase()] || raw;
}

function ProviderPill({ provider, color }) {
  const label = providerLabel(provider);
  return (
    <span className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold" style={{ color, background: `${color}14`, borderColor: `${color}35` }}>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(23,33,27,0.07)] ring-1 ring-[rgba(23,33,27,0.10)]">
        <ProviderIcon src={providerIconPath(provider)} alt={label} size={16} className="h-4 w-4 rounded-full object-cover" fallbackText={label.slice(0, 2).toUpperCase()} />
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}

// ─── icons (inline SVG, no emoji) ───────────────────────────────────────────
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const IconChevronUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);
const IconActivity = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconZap = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCpu = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M9 2v2M2 15h2M2 9h2M15 20v2M9 20v2M20 15h2M20 9h2"/>
  </svg>
);
const IconUser = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

// ─── stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "10px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ color: accent || "var(--color-primary)", opacity: 0.8 }}><Icon /></span>
      </div>
      <div style={{ fontSize: "22px", fontWeight: 600, color: "var(--color-text-main)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: "var(--color-text-subtle)" }}>{sub}</div>}
    </div>
  );
}

// ─── log row (message bubble style) ─────────────────────────────────────────
function LogRow({ entry }) {
  const color = providerColor(entry.provider);
  const isOk = entry.status === "ok";
  const total = entry.inputTokens + entry.outputTokens;
  const label = providerLabel(entry.provider);

  return (
    <div className="group relative flex items-start gap-3 theme-glass rounded-2xl px-3 py-3 transition-all duration-200 hover:border-[rgba(23,33,27,0.16)] hover:shadow-[0_14px_34px_-24px_rgba(23,33,27,0.28)] sm:px-4 sm:py-3.5">
      {/* Provider avatar */}
      <div className="relative flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ background: `linear-gradient(135deg, ${color}22, ${color}0a)`, border: `1px solid ${color}30` }}>
          <ProviderIcon src={providerIconPath(entry.provider)} alt={label} size={24} className="h-6 w-6 rounded-lg object-cover" fallbackText={label.slice(0, 2).toUpperCase()} />
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-[rgba(255,248,220,0.95)] ${isOk ? "bg-emerald-500" : "bg-red-500"}`} aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        {/* Top row: model + time */}
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono text-[13px] font-semibold text-text-main">{entry.model}</div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5 text-[11px] text-text-subtle">
            <IconClock />
            <span>{relativeTime(entry.timestamp)}</span>
          </div>
        </div>

        {/* Second row: provider + account */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color, background: `${color}14` }}>
            {label}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-text-subtle">
            <IconUser />
            <span className="truncate">{entry.account}</span>
          </span>
        </div>

        {/* Token stats row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(23,33,27,0.08)] bg-[rgba(255,248,220,0.56)] px-2 py-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">In</span>
            <span className="font-mono text-[11px] font-semibold text-text-main">{fmt(entry.inputTokens)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(23,33,27,0.08)] bg-[rgba(255,248,220,0.56)] px-2 py-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Out</span>
            <span className="font-mono text-[11px] font-semibold text-text-main">{fmt(entry.outputTokens)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1" style={{ borderColor: `${color}25`, background: `${color}0d` }}>
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>Total</span>
            <span className="font-mono text-[11px] font-semibold" style={{ color }}>{fmt(total)}</span>
          </div>
          <div className={`ml-auto inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isOk ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-red-500/25 bg-red-500/10 text-red-400"}`}>
            {isOk ? "OK" : "ERR"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── mobile log row ───────────────────────────────────────────────────────────
function LogRowMobile({ entry }) {
  return <LogRow entry={entry} />;
}

// ─── main component ───────────────────────────────────────────────────────────
export default function RequestLogsTable() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch("/api/usage/request-logs?limit=500", { cache: "no-store" }),
        fetch("/api/usage/stats", { cache: "no-store" }),
      ]);
      const logsData = await logsRes.json();
      const statsData = statsRes.ok ? await statsRes.json() : null;
      const parsed = (Array.isArray(logsData) ? logsData : []).map(parseLogLine).filter(Boolean);
      setLogs(parsed);
      setStats(statsData);
    } catch (e) {
      console.error("Failed to fetch logs", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // unique providers for filter
  const providers = [...new Set(logs.map(l => l.provider).filter(Boolean))].sort();

  // filter + sort
  const filtered = logs.filter(l => {
    if (filterProvider && l.provider !== filterProvider) return false;
    if (filterStatus && l.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.model?.toLowerCase().includes(q) || l.account?.toLowerCase().includes(q) || l.provider?.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    let av, bv;
    if (sortField === "inputTokens") { av = a.inputTokens; bv = b.inputTokens; }
    else if (sortField === "outputTokens") { av = a.outputTokens; bv = b.outputTokens; }
    else if (sortField === "total") { av = a.inputTokens + a.outputTokens; bv = b.inputTokens + b.outputTokens; }
    else { av = a.timestamp; bv = b.timestamp; }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
    setPage(0);
  };

  const SortBtn = ({ field, label }) => (
    <button onClick={() => toggleSort(field)} style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      background: "none", border: "none", cursor: "pointer",
      color: sortField === field ? "var(--color-primary)" : "var(--color-text-muted)",
      fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
      padding: 0,
    }}>
      {label}
      {sortField === field ? (sortDir === "asc" ? <IconChevronUp /> : <IconChevronDown />) : <span style={{ opacity: 0.3 }}><IconChevronDown /></span>}
    </button>
  );

  const totalTokens = stats ? (stats.totalPromptTokens || 0) + (stats.totalCompletionTokens || 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
        <StatCard label="Requests" value={fmt(stats?.totalRequests || 0)} sub="all time" icon={IconActivity} accent="#3B82F6" />
        <StatCard label="Input tokens" value={fmt(stats?.totalPromptTokens || 0)} sub="prompt" icon={IconZap} accent="#A855F7" />
        <StatCard label="Output tokens" value={fmt(stats?.totalCompletionTokens || 0)} sub="completion" icon={IconCpu} accent="#10B981" />
        <StatCard label="Total cost" value={`$${(stats?.totalCost || 0).toFixed(2)}`} sub="estimated" icon={IconActivity} accent="#F59E0B" />
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 theme-glass rounded-2xl p-3">
        {/* search */}
        <div style={{ position: "relative", flex: "1 1 180px", minWidth: "140px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-subtle)", pointerEvents: "none" }}>
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search model, account..."
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,248,220,0.62)",
              border: "1px solid var(--color-border)",
              borderRadius: "7px",
              padding: "7px 10px 7px 30px",
              fontSize: "13px",
              color: "var(--color-text-main)",
              outline: "none",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-subtle)", display: "flex" }}>
              <IconX />
            </button>
          )}
        </div>

        {/* provider filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProviderDropdownOpen((v) => !v)}
            className="flex h-9 min-w-[190px] items-center justify-between gap-3 rounded-xl border border-[rgba(23,33,27,0.10)] bg-[rgba(255,248,220,0.72)] px-3 text-left text-[12px] text-text-main transition-colors hover:border-[rgba(14,142,142,0.32)] hover:bg-[rgba(255,248,220,0.92)]"
          >
            <span className="flex min-w-0 items-center gap-2">
              {filterProvider ? (
                <ProviderIcon src={providerIconPath(filterProvider)} alt={providerLabel(filterProvider)} size={18} className="h-[18px] w-[18px] rounded object-cover" fallbackText={providerLabel(filterProvider).slice(0, 2).toUpperCase()} />
              ) : (
                <span className="material-symbols-outlined text-[18px] text-text-muted">apps</span>
              )}
              <span className="truncate">{filterProvider ? providerLabel(filterProvider) : "All providers"}</span>
            </span>
            <span className="material-symbols-outlined text-[18px] text-text-muted">expand_more</span>
          </button>
          {providerDropdownOpen && (
            <>
              <button type="button" className="fixed inset-0 z-[100] bg-transparent" onClick={() => setProviderDropdownOpen(false)} aria-label="Close provider filter" />
              <div className="absolute left-0 right-auto z-[110] mt-2 w-[min(82vw,260px)] max-h-80 overflow-y-auto rounded-2xl border border-[rgba(23,33,27,0.10)] bg-[rgba(255,248,220,0.98)] p-1.5 shadow-2xl shadow-[rgba(23,33,27,0.16)] backdrop-blur sm:left-auto sm:right-0 sm:w-[260px]">
                {["", ...providers].map((p) => {
                  const active = filterProvider === p;
                  const label = p ? providerLabel(p) : "All providers";
                  return (
                    <button key={p || "all"} type="button" onClick={() => { setFilterProvider(p); setProviderDropdownOpen(false); setPage(0); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${active ? "bg-primary/10 text-primary" : "text-text-main hover:bg-[rgba(23,33,27,0.06)]"}`}>
                      {p ? <ProviderIcon src={providerIconPath(p)} alt={label} size={22} className="h-[22px] w-[22px] rounded object-cover" fallbackText={label.slice(0, 2).toUpperCase()} /> : <span className="material-symbols-outlined text-[20px]">apps</span>}
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      {active && <span className="material-symbols-outlined text-[18px]">check</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* status filter */}
        <div className="relative">
          <button type="button" onClick={() => setStatusDropdownOpen((v) => !v)} className="flex h-9 min-w-[120px] items-center justify-between gap-2 rounded-xl border border-[rgba(23,33,27,0.10)] bg-[rgba(255,248,220,0.72)] px-3 text-[12px] text-text-main transition-colors hover:border-[rgba(14,142,142,0.32)] hover:bg-[rgba(255,248,220,0.92)]">
            <span>{filterStatus ? (filterStatus === "ok" ? "OK only" : "Error only") : "All status"}</span>
            <span className="material-symbols-outlined text-[18px] text-text-muted">expand_more</span>
          </button>
          {statusDropdownOpen && (
            <>
              <button type="button" className="fixed inset-0 z-[100] bg-transparent" onClick={() => setStatusDropdownOpen(false)} aria-label="Close status filter" />
              <div className="absolute left-0 right-auto z-[110] mt-2 w-[min(70vw,160px)] rounded-2xl border border-[rgba(23,33,27,0.10)] bg-[rgba(255,248,220,0.98)] p-1.5 shadow-2xl shadow-[rgba(23,33,27,0.16)] backdrop-blur sm:left-auto sm:right-0 sm:w-[160px]">
                {[{id:"",label:"All status"},{id:"ok",label:"OK only"},{id:"error",label:"Error only"}].map((item) => (
                  <button key={item.id || "all"} type="button" onClick={() => { setFilterStatus(item.id); setStatusDropdownOpen(false); setPage(0); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${filterStatus === item.id ? "bg-primary/10 text-primary" : "text-text-main hover:bg-[rgba(23,33,27,0.06)]"}`}>
                    {item.label}
                    {filterStatus === item.id && <span className="material-symbols-outlined text-[18px]">check</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* refresh */}
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "rgba(255,248,220,0.62)",
            border: "1px solid var(--color-border)",
            borderRadius: "7px",
            padding: "7px 12px",
            fontSize: "12px",
            color: "var(--color-text-muted)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "all 150ms ease",
          }}
        >
          <span style={{ display: "flex", animation: loading ? "spin 1s linear infinite" : "none" }}><IconRefresh /></span>
          Refresh
        </button>

        {/* count */}
        <span style={{ fontSize: "12px", color: "var(--color-text-subtle)", marginLeft: "auto" }}>
          {fmt(filtered.length)} entries
        </span>
      </div>

      {/* logs */}
      <div className="theme-glass rounded-2xl p-3">
        <div className="mb-3 flex flex-wrap items-center gap-3 border-b border-[rgba(23,33,27,0.08)] px-1 pb-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Sort</span>
          <SortBtn field="timestamp" label="Time" />
          <SortBtn field="total" label="Total" />
          <SortBtn field="inputTokens" label="Input" />
          <SortBtn field="outputTokens" label="Output" />
        </div>

        {/* rows */}
        {loading ? (
          <div style={{ padding: "48px 16px", textAlign: "center", color: "var(--color-text-subtle)", fontSize: "13px" }}>
            Loading...
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: "48px 16px", textAlign: "center", color: "var(--color-text-subtle)", fontSize: "13px" }}>
            No entries found
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((entry, i) => (
              isMobile
                ? <LogRowMobile key={i} entry={entry} />
                : <LogRow key={i} entry={entry} index={i} />
            ))}
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px",
            borderTop: "1px solid var(--color-border)",
            background: "rgba(255,248,220,0.62)",
          }}>
            <span style={{ fontSize: "12px", color: "var(--color-text-subtle)" }}>
              Page {page + 1} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  background: "var(--color-surface)", border: "1px solid var(--color-border)",
                  borderRadius: "6px", padding: "5px 12px", fontSize: "12px",
                  color: page === 0 ? "var(--color-text-subtle)" : "var(--color-text-main)",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                }}
              >Prev</button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  background: "var(--color-primary)", border: "none",
                  borderRadius: "6px", padding: "5px 12px", fontSize: "12px",
                  color: "#fff", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  opacity: page >= totalPages - 1 ? 0.5 : 1,
                }}
              >Next</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: var(--color-text-subtle); }
      `}</style>
    </div>
  );
}
