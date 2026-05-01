# 9router Upstream Test Notes

## Last test
- Date: 2026-05-01
- Test branch: `update/upstream-master-20260501`
- Merged upstream: `upstream/master` at `3f17ee0` (`Add sticky round-robin for combos (#831)`)
- Result merge commit in sandbox branch: `c70f055` (`Merge upstream master into test branch`)
- Final pushed main commit: `f46fdfb` (`Merge upstream master updates`)
- Package version after upstream update: `0.4.11`
- Sandbox test port used: `8322`
- Live/original port: `8222`

## Test result
- `npm install` completed.
- `npm run build` completed successfully in sandbox.
- Sandbox server on `8322` returned `/api/health` = `{ "ok": true }`.
- Merge conflicts were resolved in:
  - `src/app/(dashboard)/dashboard/providers/[id]/page.js`
  - `src/app/(dashboard)/dashboard/usage/page.js`
- Resolution preserved Zhen custom reset usage/responsive UI and accepted upstream compatible-provider connection restrictions.

## Cleanup after test
- Sandbox server `8322` stopped.
- `node_modules` removed to save disk.
- `.next` build output removed to save disk.
- Project folder kept for future upstream testing.

## Next time
Run:
```bash
cd /root/.openclaw/workspace/projects/9router-upstream-test
git fetch origin upstream --prune
git checkout -B update/upstream-master-YYYYMMDD origin/main
git merge upstream/master
npm install
npm run build
PORT=8322 npm start
```
