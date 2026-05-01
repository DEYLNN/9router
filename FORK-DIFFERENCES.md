# Fork Differences — DEYLNN/9router `main` vs upstream `master`

This file documents the intentional differences in Zhen's fork so future upstream merges can preserve local features.

## Branch model

- Upstream official repo: `decolua/9router`
- Official branch: `upstream/master`
- Zhen fork repo: `DEYLNN/9router`
- Zhen active branch: `origin/main`
- Live workspace path: `/root/.openclaw/workspace/projects/9router`
- Live service port: `8222`
- Sandbox test path: `/root/.openclaw/workspace/projects/9router-upstream-test`
- Sandbox test port: `8322`

## Last known sync marker

- Last merged upstream version: `0.4.12`
- Last upstream commit included: `ef3abea` (`Update ChangeLog`)
- Last local main merge commit: `f9512a0` (`Merge upstream v0.4.12 updates`)

## Local fork features to preserve

### 1. Cloudflare AI provider support

The fork adds Cloudflare provider support and related icons/assets.

Relevant areas:

```txt
src/shared/constants/providers.js
open-sse/config/providers.js
open-sse/config/providerModels.js
public/providers/cloudflare.png
public/providers/cloudflare-ai.png
```

Merge note:
- Upstream may not keep these assets/aliases.
- Do not drop Cloudflare provider entries when syncing upstream.

### 2. Auth files dashboard / Codex auth helpers

The fork includes dashboard/API support for auth files and Codex refresh workflows.

Relevant areas:

```txt
src/app/(dashboard)/dashboard/auth-files/page.js
src/app/api/auth-files/route.js
src/app/api/auth-files/refresh-codex/route.js
```

Merge note:
- Upstream previously did not include these files.
- If upstream deletes/does not know these routes, keep local fork versions unless Zhen explicitly removes the feature.

### 3. Usage reset feature

The fork adds a reset usage action for clearing local usage/log data.

Relevant areas:

```txt
src/app/(dashboard)/dashboard/usage/page.js
src/app/api/usage/reset/route.js
```

Merge note:
- Preserve the `Reset Usage` UI button and `/api/usage/reset` route.
- This file has conflicted with upstream responsive/layout updates before.
- Preferred resolution: keep local reset functionality + adopt upstream layout improvements when compatible.

### 4. Mobile/responsive dashboard polish

The fork includes multiple responsive/mobile UI fixes for dashboard pages and controls.

Relevant areas:

```txt
src/app/(dashboard)/dashboard/endpoint/EndpointPageClient.js
src/app/(dashboard)/dashboard/profile/page.js
src/app/(dashboard)/dashboard/providers/[id]/page.js
src/app/(dashboard)/dashboard/providers/[id]/CompatibleModelsSection.js
src/app/(dashboard)/dashboard/usage/page.js
```

Merge note:
- Preserve mobile-safe layouts, full-width buttons on small screens, responsive provider controls, and quota/dashboard UI fixes.
- Upstream responsive improvements can be merged, but do not regress the fork's mobile behavior.

### 5. Provider/model routing tweaks

The fork has local provider/model routing changes and provider list adjustments.

Relevant areas:

```txt
open-sse/config/providerModels.js
open-sse/config/providers.js
open-sse/services/model.js
src/sse/services/model.js
src/app/api/providers/route.js
src/app/api/providers/validate/route.js
src/shared/constants/providers.js
```

Merge note:
- Always review provider aliases/prefixes carefully.
- Upstream `v0.4.12` added Xiaomi MiMo support and fixed custom provider prefix conflicts; keep that upstream fix.
- Preserve local custom providers unless intentionally removed.

### 6. Workflow / sync notes

The fork uses a sandbox workflow for upstream sync testing.

Recommended safe upstream sync flow:

```bash
cd /root/.openclaw/workspace/projects/9router-upstream-test
fuser -k 8322/tcp 2>/dev/null || true
git fetch origin --prune
git fetch upstream --prune
git checkout -B update/upstream-master-YYYYMMDD origin/main
git merge upstream/master
npm install
npm run build
npm start -- -p 8322
curl http://127.0.0.1:8322/api/health
```

Only after sandbox test is OK:

```bash
git checkout main
git pull --ff-only origin main
git merge --no-ff update/upstream-master-YYYYMMDD -m "Merge upstream updates"
git push origin main
cd /root/.openclaw/workspace/projects/9router
git pull --ff-only origin main
npm install
npm run build
fuser -k 8222/tcp 2>/dev/null || true
npm start -- -p 8222
```

## Files that commonly conflict

```txt
CHANGELOG.md
package.json
open-sse/config/providerModels.js
open-sse/config/providers.js
open-sse/services/model.js
src/shared/constants/providers.js
src/app/(dashboard)/dashboard/providers/[id]/page.js
src/app/(dashboard)/dashboard/usage/page.js
src/app/api/providers/validate/route.js
src/lib/localDb.js
src/lib/usageDb.js
```

## Merge policy

When syncing upstream:

1. Never test directly on live port `8222`.
2. Use sandbox folder `9router-upstream-test` and port `8322` first.
3. Preserve fork-only features unless Zhen explicitly says to remove them.
4. Prefer upstream bug fixes when they do not break fork features.
5. Run `npm run build` before pushing to main.
6. Restart live only after build succeeds and Zhen confirms or explicitly asks.
