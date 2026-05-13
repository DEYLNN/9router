import { NextResponse } from "next/server";
import { clearConsoleLogs, getConsoleLogs, initConsoleLogCapture } from "@/lib/consoleLogBuffer";
import { getRecentLogs } from "@/lib/usageDb";

initConsoleLogCapture();

function formatUsageLine(line) {
  if (typeof line === "string") return line;
  const [ts = "", model = "", provider = "", account = "", input = "0", output = "0", status = "ok"] = line || [];
  const displayTs = ts ? new Date(ts).toLocaleString() : "";
  return `[USAGE] ${displayTs} | ${provider} | ${model} | account=${account} | in=${input} | out=${output} | ${status}`;
}

export async function GET() {
  try {
    const usageLogs = (await getRecentLogs(120)).reverse().map(formatUsageLine);
    const logs = [...usageLogs, ...getConsoleLogs()].slice(-300);
    return NextResponse.json({ success: true, logs, dataStore: "sqlite" });
  } catch (error) {
    console.error("Error getting console logs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    clearConsoleLogs();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing console logs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
