import { NextResponse } from "next/server";
import { resetUsageData } from "@/lib/usageDb.js";

export async function POST() {
  try {
    const result = await resetUsageData();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to reset usage data" },
      { status: 500 }
    );
  }
}