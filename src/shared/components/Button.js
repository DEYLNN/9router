"use client";

import { cn } from "@/shared/utils/cn";

const variants = {
  primary: "bg-[#3B82F6] hover:bg-[#2563EB] text-white disabled:opacity-40",
  secondary: "bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-main)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)] disabled:opacity-40",
  outline: "border border-[rgba(255,255,255,0.12)] text-[var(--color-text-main)] hover:bg-[var(--color-surface-2)] hover:border-[rgba(59,130,246,0.4)]",
  ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-main)]",
  danger: "bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.18)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] disabled:opacity-40",
  success: "bg-[rgba(16,185,129,0.1)] hover:bg-[rgba(16,185,129,0.18)] text-[#10B981] border border-[rgba(16,185,129,0.2)] disabled:opacity-40",
};

const sizes = {
  sm: "h-7 px-3 text-xs rounded-[8px]",
  md: "h-9 px-4 text-sm rounded-[10px]",
  lg: "h-11 px-6 text-sm rounded-[10px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out cursor-pointer",
        "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
      ) : icon ? (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span style={{ display: "flex", alignItems: "center" }}>{iconRight}</span>
      )}
    </button>
  );
}

// Note: add @keyframes spin to globals.css if not present
