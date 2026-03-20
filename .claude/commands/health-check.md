Please run a full health check on the expense tracker project. Cover all of the following:

**1. Build & Type Safety**
- Run `npm run build` and report whether it passes or fails
- Run `npm run lint` and report any warnings or errors
- List any TypeScript `any` types or `@ts-ignore` comments found in the codebase

**2. Git Hygiene**
- Run `git status` — flag any uncommitted changes
- Run `git log --oneline origin/$(git branch --show-current)..HEAD` — flag any unpushed commits
- List all branches and identify any that appear stale (not pushed to origin or have no recent commits)
- List all active worktrees and confirm they are in a clean state

**3. localStorage Integrity**
- Verify that every localStorage key used in the codebase is documented in CLAUDE.md
- Check that all localStorage reads are wrapped in try/catch

**4. Code Quality Checks**
- Find any hardcoded strings that should come from `lib/constants.ts` (category names, the storage key)
- Find any `setTimeout` calls that are missing cleanup (no corresponding `clearTimeout` in a useEffect return)
- Find any components that read from `localStorage` directly (should only be done in hooks)
- Check that every new file added uses the `'use client'` directive where required

**5. CLAUDE.md Currency**
- Check whether the branch list in CLAUDE.md matches the actual branches in the repo
- Check whether the localStorage keys table is complete and accurate
- Flag anything in the codebase that contradicts or is missing from CLAUDE.md

Produce a concise report with a ✅ / ⚠️ / ❌ status for each section. End with a prioritised list of the top issues to fix.
