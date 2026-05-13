"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Toggle } from "@/shared/components";
import { useNotificationStore } from "@/store/notificationStore";

const Icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
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
  return owner.split(/[\/_-]/).filter(Boolean).slice(0, 2).join(" ") || owner;
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

  useEffect(() => { fetchModels(); }, []);

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

  return (
    <div style={{ padding: "clamp(4px, 1.5vw, 14px)", maxWidth: "1180px", margin: "0 auto" }}>
      <section className="theme-glass" style={{ borderRadius: 16, padding: "clamp(8px, 2vw, 12px)", marginBottom: 12 }}>
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
          <button onClick={() => setOnlyEnabled(!onlyEnabled)} style={{ height: 36, border: "1px solid var(--theme-glass-border)", borderRadius: 12, padding: "0 12px", color: onlyEnabled ? "var(--theme-accent-teal)" : "var(--color-text-muted)", background: onlyEnabled ? "rgba(14,142,142,.10)" : "rgba(255,251,236,.36)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Enabled only
          </button>
          <Button variant="secondary" size="sm" onClick={() => save(filtered.map((m) => m.id))} disabled={loading || saving}>Enable shown</Button>
          <Button variant="secondary" size="sm" onClick={() => save([])} disabled={loading || saving}>Disable all</Button>
          {saving && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Saving…</span>}
        </div>
      </section>

      {loading ? (
        <div className="theme-glass" style={{ borderRadius: 16, padding: 28, color: "var(--color-text-muted)" }}>Loading model inventory…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="theme-glass" style={{ borderRadius: 16, padding: 28, color: "var(--color-text-muted)" }}>No models found.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {Object.entries(grouped).map(([owner, items]) => {
            const enabledCount = items.filter((m) => enabledSet.has(m.id)).length;
            return (
              <div key={owner} className="theme-glass" style={{ borderRadius: 16, overflow: "hidden" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px clamp(12px, 2vw, 16px)",
                  borderBottom: "1px solid rgba(23,33,27,0.08)",
                  background: "rgba(255,248,220,0.42)",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontSize: 13.5, fontWeight: 760, margin: 0, textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-main)" }}>{shortProviderName(owner)}</h2>
                    <div className="theme-mono" style={{ fontSize: 10.5, color: "var(--color-text-muted)", marginTop: 1, wordBreak: "break-all" }}>{owner}</div>
                  </div>
                  <span className="theme-mono" style={{ fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}>{enabledCount}/{items.length}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {items.map((model, index) => {
                    const enabled = enabledSet.has(model.id);
                    return (
                      <div key={model.id} style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px clamp(12px, 2vw, 16px)",
                        borderTop: index === 0 ? "none" : "1px solid rgba(23,33,27,0.065)",
                        background: enabled ? "rgba(14,142,142,0.06)" : "rgba(255,251,236,0.20)",
                      }}>
                        <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: enabled ? "var(--theme-accent-teal)" : "rgba(31,42,36,0.22)",
                            boxShadow: enabled ? "0 0 0 4px rgba(14,142,142,0.12)" : "none",
                            flexShrink: 0,
                          }} />
                          <div style={{ minWidth: 0 }}>
                            <div className="theme-mono" style={{ fontSize: 12.5, fontWeight: 650, color: "var(--color-text-main)", wordBreak: "break-word", lineHeight: 1.35 }}>{model.id}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 10.5, color: enabled ? "var(--theme-accent-teal)" : "var(--color-text-muted)", fontWeight: 750, textTransform: "uppercase", letterSpacing: ".08em" }}>{enabled ? "Exposed" : "Private"}</span>
                              <span className="theme-mono" style={{ fontSize: 10.5, color: "var(--color-text-subtle)" }}>owned_by: {model.owned_by}</span>
                            </div>
                          </div>
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
