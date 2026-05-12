"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  // format: "09-05-2026 20:31:30"
  const [datePart, timePart] = str.split(" ");
  if (!datePart || !timePart) return str;
  const [dd, mm, yyyy] = datePart.split("-");
  const d = new Date(`${yyyy}-${mm}-${dd}T${timePart}Z`);
  if (isNaN(d)) return str;
  const diff = Math.floor((Date.now() - d) / 1000);
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

// ─── log row ─────────────────────────────────────────────────────────────────
function LogRow({ entry, index }) {
  const color = providerColor(entry.provider);
  const isOk = entry.status === "ok";
  const total = entry.inputTokens + entry.outputTokens;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto auto auto auto",
      gap: "0 16px",
      alignItems: "center",
      padding: "10px 16px",
      borderBottom: "1px solid var(--color-border-subtle)",
      transition: "background 150ms ease",
      cursor: "default",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--color-surface-2)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* model + account */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <span style={{
            display: "inline-block",
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {entry.model}
          </span>
          <span style={{
            fontSize: "10px",
            fontWeight: 600,
            color: color,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            borderRadius: "4px",
            padding: "1px 5px",
            flexShrink: 0,
          }}>
            {entry.provider}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-subtle)", fontSize: "11px" }}>
          <IconUser />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.account}</span>
        </div>
      </div>

      {/* input tokens */}
      <div style={{ textAlign: "right", minWidth: "64px" }}>
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(entry.inputTokens)}</div>
        <div style={{ fontSize: "10px", color: "var(--color-text-subtle)" }}>in</div>
      </div>

      {/* output tokens */}
      <div style={{ textAlign: "right", minWidth: "64px" }}>
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(entry.outputTokens)}</div>
        <div style={{ fontSize: "10px", color: "var(--color-text-subtle)" }}>out</div>
      </div>

      {/* total */}
      <div style={{ textAlign: "right", minWidth: "72px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-main)", fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</div>
        <div style={{ fontSize: "10px", color: "var(--color-text-subtle)" }}>total</div>
      </div>

      {/* status + time */}
      <div style={{ textAlign: "right", minWidth: "72px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          fontSize: "10px",
          fontWeight: 600,
          color: isOk ? "#10B981" : "#ef4444",
          background: isOk ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${isOk ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          borderRadius: "4px",
          padding: "2px 6px",
          marginBottom: "2px",
        }}>
          {isOk ? "ok" : "err"}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "3px", color: "var(--color-text-subtle)", fontSize: "10px" }}>
          <IconClock />
          {relativeTime(entry.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ─── mobile log row ───────────────────────────────────────────────────────────
function LogRowMobile({ entry }) {
  const color = providerColor(entry.provider);
  const isOk = entry.status === "ok";
  const total = entry.inputTokens + entry.outputTokens;

  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: "1px solid var(--color-border-subtle)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.model}</span>
        </div>
        <span style={{
          fontSize: "10px", fontWeight: 600, color: isOk ? "#10B981" : "#ef4444",
          background: isOk ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${isOk ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          borderRadius: "4px", padding: "2px 6px", flexShrink: 0,
        }}>{isOk ? "ok" : "err"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "10px", fontWeight: 600, color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: "4px", padding: "1px 5px" }}>{entry.provider}</span>
        <span style={{ fontSize: "11px", color: "var(--color-text-subtle)" }}>{entry.account}</span>
        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>{fmt(total)} tok</span>
        <span style={{ fontSize: "10px", color: "var(--color-text-subtle)" }}>{relativeTime(entry.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function RequestLogsTable() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "12px 14px",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center",
      }}>
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
              background: "var(--color-surface-2)",
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
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "var(--color-text-subtle)" }}><IconFilter /></span>
          <select
            value={filterProvider}
            onChange={e => { setFilterProvider(e.target.value); setPage(0); }}
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "7px",
              padding: "7px 10px",
              fontSize: "12px",
              color: "var(--color-text-main)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All providers</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* status filter */}
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: "7px",
            padding: "7px 10px",
            fontSize: "12px",
            color: "var(--color-text-main)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">All status</option>
          <option value="ok">OK</option>
          <option value="error">Error</option>
        </select>

        {/* refresh */}
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "var(--color-surface-2)",
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

      {/* table */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        overflow: "hidden",
      }}>
        {/* desktop header */}
        {!isMobile && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto auto",
            gap: "0 16px",
            padding: "10px 16px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Model / Account
            </div>
            <div style={{ textAlign: "right", minWidth: "64px" }}><SortBtn field="inputTokens" label="In" /></div>
            <div style={{ textAlign: "right", minWidth: "64px" }}><SortBtn field="outputTokens" label="Out" /></div>
            <div style={{ textAlign: "right", minWidth: "72px" }}><SortBtn field="total" label="Total" /></div>
            <div style={{ textAlign: "right", minWidth: "72px" }}><SortBtn field="timestamp" label="Time" /></div>
          </div>
        )}

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
          paginated.map((entry, i) =>
            isMobile
              ? <LogRowMobile key={i} entry={entry} />
              : <LogRow key={i} entry={entry} index={i} />
          )
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px",
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
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
