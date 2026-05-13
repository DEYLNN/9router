"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Toggle, Badge } from "@/shared/components";
import { useNotificationStore } from "@/store/notificationStore";

const Icons = {
  models: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <path d="M15 16h4M17 14v4" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  ),
  globe: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.3 2.4 3.4 5.4 3.4 9s-1.1 6.6-3.4 9M12 3C9.7 5.4 8.6 8.4 8.6 12s1.1 6.6 3.4 9" />
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 20 6v6c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V6l8-3Z" /><path d="m9 12 2 2 4-5" />
    </svg>
  ),
  spark: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  ),
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="9" width="11" height="11" rx="2" /><rect x="4" y="4" width="11" height="11" rx="2" />
    </svg>
  ),
};

function groupByOwner(models) {
  return models.reduce((acc, model) => {
    const owner = model.owned_by || "unknown";
    if (!acc[owner]) acc[owner] = [];
    acc[owner].push(model);
    return acc;
  }, {});
}

function shortProviderName(owner) {
  return owner
    .split(/[\/_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .join(" ") || owner;
}

function ProviderAvatar({ owner }) {
  const label = shortProviderName(owner).slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 12,
      display: "grid",
      placeItems: "center",
      color: "#fff",
      fontSize: 12,
      fontWeight: 750,
      letterSpacing: ".04em",
      background: "linear-gradient(135deg, rgba(59,130,246,.95), rgba(168,85,247,.95) 55%, rgba(20,184,166,.9))",
      boxShadow: "0 10px 30px rgba(59,130,246,.18), inset 0 1px 0 rgba(255,255,255,.25)",
    }}>{label}</div>
  );
}

export default function PublicModelsPage() {
  const notify = useNotificationStore();
  const [models, setModels] = useState([]);
  const [enabledIds, setEnabledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [onlyEnabled, setOnlyEnabled] = useState(false);

  const enabledSet = useMemo(() => new Set(enabledIds), [enabledIds]);
  const publicUrl = "/v1/models";

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/models/public", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch models");
      setModels(data.models || []);
      setEnabledIds(data.enabledIds || []);
    } catch (error) {
      notify.error(error.message || "Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const save = async (nextIds) => {
    setEnabledIds(nextIds);
    setSaving(true);
    try {
      const res = await fetch("/api/models/public", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabledIds: nextIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save models");
      setEnabledIds(data.enabledIds || nextIds);
    } catch (error) {
      notify.error(error.message || "Failed to save models");
      fetchModels();
    } finally {
      setSaving(false);
    }
  };

  const toggleModel = (modelId, checked) => {
    const next = checked
      ? Array.from(new Set([...enabledIds, modelId]))
      : enabledIds.filter((id) => id !== modelId);
    save(next);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter((model) => {
      if (onlyEnabled && !enabledSet.has(model.id)) return false;
      if (!q) return true;
      return model.id.toLowerCase().includes(q) || (model.owned_by || "").toLowerCase().includes(q);
    });
  }, [models, query, onlyEnabled, enabledSet]);

  const grouped = groupByOwner(filtered);
  const providersCount = Object.keys(groupByOwner(models)).length;
  const enabledRatio = models.length ? Math.round((enabledIds.length / models.length) * 100) : 0;

  return (
    <div style={{ padding: "clamp(6px, 2vw, 22px)", maxWidth: "1360px", margin: "0 auto" }}>
      <section style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "clamp(16px, 4vw, 24px)",
        padding: "clamp(13px, 3vw, 26px)",
        marginBottom: 18,
        background: "radial-gradient(circle at 12% 10%, rgba(59,130,246,.24), transparent 35%), radial-gradient(circle at 82% 0%, rgba(168,85,247,.22), transparent 30%), linear-gradient(135deg, rgba(255,255,255,.075), rgba(255,255,255,.025))",
        boxShadow: "0 28px 90px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08)",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "34px 34px", maskImage: "linear-gradient(to bottom, black, transparent 80%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", minWidth: 0 }}>
            <div style={{ width: "clamp(44px, 12vw, 54px)", height: "clamp(44px, 12vw, 54px)", borderRadius: 16, display: "grid", placeItems: "center", color: "#fff", background: "linear-gradient(135deg, #2563eb, #7c3aed 55%, #14b8a6)", boxShadow: "0 18px 42px rgba(37,99,235,.35)", flex: "0 0 auto" }}>
              {Icons.models}
            </div>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <Badge variant="primary" size="sm" dot>OpenAI compatible</Badge>
                <Badge variant="success" size="sm">/v1/models</Badge>
              </div>
              <h1 style={{ fontSize: "clamp(26px, 8vw, 32px)", lineHeight: 1.05, fontWeight: 760, letterSpacing: "-.04em", margin: 0 }}>Models</h1>
              <p style={{ maxWidth: 680, color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.65, margin: "10px 0 0" }}>
                Curate exactly which backend models are visible to public clients. Internal provider inventory stays private; only enabled models appear in the public model list.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: "max-content", maxWidth: "100%" }}>
            <Button variant="secondary" size="sm" onClick={fetchModels} disabled={loading || saving}>Refresh</Button>
            <Button variant="primary" size="sm" onClick={() => window.open(publicUrl, "_blank")}>Open endpoint</Button>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 12, marginBottom: 18 }}>
        {[
          { icon: Icons.globe, label: "Exposed", value: enabledIds.length, hint: `${enabledRatio}% of inventory`, color: "#10b981" },
          { icon: Icons.shield, label: "Hidden", value: Math.max(models.length - enabledIds.length, 0), hint: "private by default", color: "#f59e0b" },
          { icon: Icons.spark, label: "Providers", value: providersCount, hint: `${models.length} total models`, color: "#60a5fa" },
        ].map((stat) => (
          <div key={stat.label} style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "clamp(11px, 2.5vw, 17px)", background: "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025))", boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ width: 34, height: 34, borderRadius: 12, display: "grid", placeItems: "center", color: stat.color, background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}>{stat.icon}</span>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{stat.hint}</span>
            </div>
            <div style={{ fontSize: "clamp(24px, 7vw, 30px)", fontWeight: 760, letterSpacing: "-.03em", marginTop: 12 }}>{loading ? "—" : stat.value}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </section>

      <section style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: "clamp(8px, 2vw, 14px)", marginBottom: 18, background: "rgba(255,255,255,.035)", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 520, minWidth: 0 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }}>{Icons.search}</span>
            <Input
              placeholder="Search model ID or provider..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 38, width: "100%" }}
            />
          </div>
          <button onClick={() => setOnlyEnabled(!onlyEnabled)} style={{ height: 36, border: "1px solid rgba(255,255,255,.09)", borderRadius: 10, padding: "0 12px", color: onlyEnabled ? "#fff" : "var(--color-text-muted)", background: onlyEnabled ? "rgba(59,130,246,.18)" : "rgba(255,255,255,.035)", cursor: "pointer", fontSize: 13 }}>
            Enabled only
          </button>
          <Button variant="secondary" size="sm" onClick={() => save(filtered.map((m) => m.id))} disabled={loading || saving}>Enable shown</Button>
          <Button variant="secondary" size="sm" onClick={() => save([])} disabled={loading || saving}>Disable all</Button>
          {saving && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Saving…</span>}
        </div>
      </section>

      {loading ? (
        <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 28, color: "var(--color-text-muted)", background: "rgba(255,255,255,.035)" }}>Loading model inventory…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 28, color: "var(--color-text-muted)", background: "rgba(255,255,255,.035)" }}>No models found.</div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {Object.entries(grouped).map(([owner, items]) => {
            const enabledCount = items.filter((m) => enabledSet.has(m.id)).length;
            return (
              <div key={owner} style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025))", boxShadow: "0 18px 45px rgba(0,0,0,.14)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "14px clamp(12px, 2vw, 18px)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <ProviderAvatar owner={owner} />
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontSize: 15, fontWeight: 690, margin: 0, textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortProviderName(owner)}</h2>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2, wordBreak: "break-all" }}>{owner}</div>
                    </div>
                  </div>
                  <Badge variant={enabledCount ? "success" : "default"} size="sm">{enabledCount}/{items.length} enabled</Badge>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 245px), 1fr))", gap: 10, padding: "clamp(8px, 2vw, 14px)" }}>
                  {items.map((model) => {
                    const enabled = enabledSet.has(model.id);
                    return (
                      <div key={model.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "clamp(9px, 2vw, 13px)", border: `1px solid ${enabled ? "rgba(16,185,129,.32)" : "rgba(255,255,255,.075)"}`, borderRadius: 14, background: enabled ? "linear-gradient(135deg, rgba(16,185,129,.12), rgba(20,184,166,.045))" : "rgba(255,255,255,.025)", boxShadow: enabled ? "inset 0 1px 0 rgba(255,255,255,.08), 0 10px 28px rgba(16,185,129,.08)" : "inset 0 1px 0 rgba(255,255,255,.04)" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 999, background: enabled ? "#10b981" : "rgba(255,255,255,.2)", boxShadow: enabled ? "0 0 0 4px rgba(16,185,129,.12)" : "none" }} />
                            <span style={{ fontSize: 11, color: enabled ? "#10b981" : "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>{enabled ? "Exposed" : "Private"}</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 570, wordBreak: "break-all", lineHeight: 1.45 }}>{model.id}</div>
                        </div>
                        <Toggle size="sm" checked={enabled} onChange={(checked) => toggleModel(model.id, checked)} disabled={saving} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
