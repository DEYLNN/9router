"use client";

import { useState, useEffect } from "react";
import Card from "@/shared/components/Card";
import Button from "@/shared/components/Button";
import PricingModal from "@/shared/components/PricingModal";

export default function PricingSettingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentPricing, setCurrentPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPricing(); }, []);

  const loadPricing = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pricing");
      if (response.ok) setCurrentPricing(await response.json());
    } catch (error) {
      console.error("Failed to load pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePricingUpdated = () => loadPricing();

  const getModelCount = () => {
    if (!currentPricing) return 0;
    return Object.values(currentPricing).reduce((sum, models) => sum + Object.keys(models || {}).length, 0);
  };

  const providers = currentPricing ? Object.keys(currentPricing).sort() : [];

  return (
    <div className="flex min-w-0 flex-col gap-6 px-1 sm:px-0">
      <Card className="overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              <h1 className="text-xl font-semibold text-text-main sm:text-2xl">Pricing Settings</h1>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-text-muted">
              Configure model pricing rates for usage cost tracking and dashboard calculations.
            </p>
          </div>
          <Button icon="edit" onClick={() => setShowModal(true)} className="w-full sm:w-auto">
            Edit Pricing
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Total Models</p>
              <p className="mt-2 text-2xl font-semibold text-text-main">{loading ? "..." : getModelCount()}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined">database</span>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Providers</p>
              <p className="mt-2 text-2xl font-semibold text-text-main">{loading ? "..." : providers.length}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined">hub</span>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Status</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">{loading ? "..." : "Active"}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-text-main">How Pricing Works</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-muted">
            <p><strong className="text-text-main">Cost Calculation:</strong> usage cost = input + output + cached + reasoning/cache-creation fallback rates.</p>
            <p><strong className="text-text-main">Pricing Format:</strong> all rates use dollars per million tokens ($/1M tokens).</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {["Input: prompt tokens", "Output: response tokens", "Cached: cache-read tokens", "Reasoning: thinking tokens", "Cache Creation: cache-write tokens"].map((item) => (
                <div key={item} className="rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-muted">{item}</div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-text-main">Current Pricing Overview</h2>
            <Button size="sm" variant="outline" icon="visibility" onClick={() => setShowModal(true)}>
              Details
            </Button>
          </div>

          {loading ? (
            <div className="mt-5 rounded-xl border border-border bg-bg p-4 text-sm text-text-muted">Loading pricing data...</div>
          ) : currentPricing ? (
            <div className="mt-4 space-y-2">
              {providers.slice(0, 7).map((provider) => (
                <div key={provider} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-3 py-2 text-sm">
                  <span className="font-semibold text-text-main">{provider.toUpperCase()}</span>
                  <span className="rounded-full bg-sidebar px-2 py-0.5 text-xs text-text-muted">{Object.keys(currentPricing[provider] || {}).length} models</span>
                </div>
              ))}
              {providers.length > 7 && <p className="pt-1 text-xs text-text-muted">+ {providers.length - 7} more providers</p>}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-border bg-bg p-4 text-sm text-text-muted">No pricing data available</div>
          )}
        </Card>
      </div>

      {showModal && <PricingModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handlePricingUpdated} />}
    </div>
  );
}
