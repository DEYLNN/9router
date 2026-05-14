export const CODEX_FREE_BLOCKED_MODELS = new Set(["gpt-5.5"]);

export function normalizeCodexPlan(plan) {
  const value = String(plan || "").trim().toLowerCase();
  if (!value) return "unknown";
  return value === "free" ? "free" : "paid";
}

export function parseAllowedModels(value) {
  if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[\n,]/).map(v => v.trim()).filter(Boolean);
  return [];
}

export function isCodexConnectionEligibleForModel(connection, model) {
  if (!model || connection?.provider !== "codex") return true;
  const psd = connection.providerSpecificData || {};
  const customAllowed = parseAllowedModels(psd.allowedModels);
  if (customAllowed.length > 0) return customAllowed.includes(model);
  const plan = normalizeCodexPlan(psd.codexPlan || psd.chatgptPlanType);
  if (CODEX_FREE_BLOCKED_MODELS.has(model) && plan === "free") return false;
  return true;
}
