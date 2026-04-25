"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UsageStats, RequestLogger, CardSkeleton, SegmentedControl, Button } from "@/shared/components";
import RequestDetailsTab from "./components/RequestDetailsTab";

export default function UsagePage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <UsageContent />
    </Suspense>
  );
}

function UsageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tabLoading, setTabLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const tabFromUrl = searchParams.get("tab");
  const activeTab = tabFromUrl && ["overview", "logs", "details"].includes(tabFromUrl)
    ? tabFromUrl
    : "overview";

  const handleTabChange = (value) => {
    if (value === activeTab) return;
    setTabLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/dashboard/usage?${params.toString()}`, { scroll: false });
    // Brief loading flash so user sees feedback
    setTimeout(() => setTabLoading(false), 300);
  };

  const handleResetUsage = async () => {
    if (resetting) return;
    const confirmed = window.confirm("Reset usage data? This will delete usage.json and log.txt only.");
    if (!confirmed) return;

    setResetting(true);
    setResetMessage("");
    try {
      const response = await fetch("/api/usage/reset", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to reset usage data");
      }
      const deleted = data.deleted?.length ? data.deleted.join(", ") : "no existing files";
      setResetMessage(`Usage reset complete (${deleted}).`);
      router.refresh();
    } catch (error) {
      setResetMessage(error.message || "Failed to reset usage data");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 px-1 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          options={[
            { value: "overview", label: "Overview" },
            { value: "details", label: "Details" },
          ]}
          value={activeTab}
          onChange={handleTabChange}
          className="w-full sm:w-auto"
        />
        <Button
          type="button"
          variant="danger"
          size="md"
          icon="delete_sweep"
          onClick={handleResetUsage}
          loading={resetting}
          className="w-full sm:w-auto"
        >
          Reset Usage
        </Button>
      </div>

      {resetMessage && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          {resetMessage}
        </div>
      )}

      {tabLoading ? (
        <CardSkeleton />
      ) : (
        <>
          {activeTab === "overview" && (
            <Suspense fallback={<CardSkeleton />}>
              <UsageStats />
            </Suspense>
          )}
          {activeTab === "logs" && <RequestLogger />}
          {activeTab === "details" && <RequestDetailsTab />}
        </>
      )}
    </div>
  );
}

