"use client";

import PropTypes from "prop-types";
import Card from "@/shared/components/Card";

const fmt = (n) => new Intl.NumberFormat().format(n || 0);
const fmtCost = (n) => `$${(n || 0).toFixed(2)}`;

export default function OverviewCards({ stats }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 sm:gap-4">
      <Card className="flex min-w-0 flex-col gap-1 px-4 py-3.5">
        <span className="text-[11px] tracking-[0.12em] text-text-muted uppercase font-semibold">Total Requests</span>
        <span className="truncate text-[26px] font-semibold theme-mono">{fmt(stats.totalRequests)}</span>
      </Card>
      <Card className="flex min-w-0 flex-col gap-1 px-4 py-3.5">
        <span className="text-[11px] tracking-[0.12em] text-text-muted uppercase font-semibold">Input Tokens</span>
        <span className="truncate text-[26px] font-semibold theme-mono" style={{ color: "var(--theme-accent-blue)" }}>{fmt(stats.totalPromptTokens)}</span>
      </Card>
      <Card className="flex min-w-0 flex-col gap-1 px-4 py-3.5">
        <span className="text-[11px] tracking-[0.12em] text-text-muted uppercase font-semibold">Output Tokens</span>
        <span className="truncate text-[26px] font-semibold theme-mono" style={{ color: "var(--theme-accent-green)" }}>{fmt(stats.totalCompletionTokens)}</span>
      </Card>
      <Card className="flex min-w-0 flex-col gap-1 px-4 py-3.5">
        <span className="text-[11px] tracking-[0.12em] text-text-muted uppercase font-semibold">Est. Cost</span>
        <span className="truncate text-[26px] font-semibold theme-mono" style={{ color: "var(--theme-accent-rose)" }}>~{fmtCost(stats.totalCost)}</span>
        <span className="text-[10px] text-text-subtle">Estimated, not actual billing</span>
      </Card>
    </div>
  );
}

OverviewCards.propTypes = {
  stats: PropTypes.object.isRequired,
};
