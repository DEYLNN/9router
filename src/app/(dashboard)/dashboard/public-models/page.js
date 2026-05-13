"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Button, Input, Toggle, Badge } from "@/shared/components";
import { useNotificationStore } from "@/store/notificationStore";

function groupByOwner(models) {
  return models.reduce((acc, model) => {
    const owner = model.owned_by || "unknown";
    if (!acc[owner]) acc[owner] = [];
    acc[owner].push(model);
    return acc;
  }, {});
}

export default function PublicModelsPage() {
  const notify = useNotificationStore();
  const [models, setModels] = useState([]);
  const [enabledIds, setEnabledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const enabledSet = useMemo(() => new Set(enabledIds), [enabledIds]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/models/public", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch public models");
      setModels(data.models || []);
      setEnabledIds(data.enabledIds || []);
    } catch (error) {
      notify.error(error.message || "Failed to fetch public models");
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
      if (!res.ok) throw new Error(data.error || "Failed to save public models");
      setEnabledIds(data.enabledIds || nextIds);
    } catch (error) {
      notify.error(error.message || "Failed to save public models");
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

  const filtered = models.filter((model) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return model.id.toLowerCase().includes(q) || (model.owned_by || "").toLowerCase().includes(q);
  });

  const grouped = groupByOwner(filtered);

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 650, margin: "0 0 6px" }}>Public Models</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "13px", margin: 0 }}>
            Choose which models are exposed by the public OpenAI-compatible <code>/v1/models</code> endpoint.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Badge variant="success" size="sm">{enabledIds.length} public</Badge>
          <Button variant="secondary" size="sm" onClick={fetchModels} disabled={loading || saving}>Refresh</Button>
        </div>
      </div>

      <Card style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <Input
            placeholder="Search model or provider..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: "360px" }}
          />
          <Button variant="secondary" size="sm" onClick={() => save(models.map((m) => m.id))} disabled={loading || saving}>Enable all shown</Button>
          <Button variant="secondary" size="sm" onClick={() => save([])} disabled={loading || saving}>Disable all</Button>
          {saving && <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Saving...</span>}
        </div>
      </Card>

      {loading ? (
        <Card style={{ padding: "24px", color: "var(--color-text-muted)" }}>Loading models...</Card>
      ) : Object.keys(grouped).length === 0 ? (
        <Card style={{ padding: "24px", color: "var(--color-text-muted)" }}>No models found.</Card>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {Object.entries(grouped).map(([owner, items]) => (
            <Card key={owner} style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                <h2 style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>{owner}</h2>
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  {items.filter((m) => enabledSet.has(m.id)).length}/{items.length} public
                </span>
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                {items.map((model) => (
                  <div key={model.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "10px 12px", border: "1px solid var(--color-border)", borderRadius: "10px", background: "var(--color-surface-2)" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 500, wordBreak: "break-all" }}>{model.id}</div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>owned_by: {model.owned_by}</div>
                    </div>
                    <Toggle
                      size="sm"
                      checked={enabledSet.has(model.id)}
                      onChange={(checked) => toggleModel(model.id, checked)}
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
