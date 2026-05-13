import { getAdapter } from "../driver.js";
import { parseJson, stringifyJson } from "../helpers/jsonCol.js";

const SCOPE = "publicModels";
const KEY = "enabledIds";

export async function getPublicModelIds() {
  const db = await getAdapter();
  const row = db.get(`SELECT value FROM kv WHERE scope = ? AND key = ?`, [SCOPE, KEY]);
  const ids = row ? parseJson(row.value, []) : [];
  return Array.isArray(ids) ? ids.filter((id) => typeof id === "string" && id.trim() !== "") : [];
}

export async function setPublicModelIds(ids) {
  const db = await getAdapter();
  const clean = Array.from(new Set((Array.isArray(ids) ? ids : []).map((id) => String(id).trim()).filter(Boolean)));
  db.run(
    `INSERT INTO kv(scope, key, value) VALUES(?, ?, ?) ON CONFLICT(scope, key) DO UPDATE SET value = excluded.value`,
    [SCOPE, KEY, stringifyJson(clean)]
  );
  return clean;
}

export async function enablePublicModels(ids) {
  const current = await getPublicModelIds();
  return setPublicModelIds([...current, ...(Array.isArray(ids) ? ids : [])]);
}

export async function disablePublicModels(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return getPublicModelIds();
  const remove = new Set(ids);
  const current = await getPublicModelIds();
  return setPublicModelIds(current.filter((id) => !remove.has(id)));
}
