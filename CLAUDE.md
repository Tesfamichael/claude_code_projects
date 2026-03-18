# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal expense tracking web app built with Next.js 14, TypeScript, and Tailwind CSS. Data is persisted in `localStorage` — no backend or database.

## Architecture

```
app/           ← Next.js App Router pages and layout
components/    ← UI components (one file per component)
hooks/         ← React hooks (useExpenses, useFilter)
lib/           ← Pure utility/service modules (no React)
types/         ← TypeScript type definitions
```

**Data flow:** `useExpenses` hook owns all expense CRUD and reads/writes to `localStorage`. Components receive data and callbacks as props — no global state manager.

**Key files:**
- `types/expense.ts` — all shared types (`Expense`, `Category`, `FilterState`, etc.)
- `lib/constants.ts` — category list, colors, icons, storage key
- `lib/utils.ts` — formatting and aggregation utilities
- `hooks/useExpenses.ts` — localStorage persistence + CRUD + CSV export
- `hooks/useFilter.ts` — search/category/date filtering with `useMemo`
- `app/page.tsx` — main page composing all components

## Running the App

```bash
cd "C:/Users/tesfa/expense-tracker-ai"
npm run dev        # starts at http://localhost:3000
npm run build      # production build (use to verify no TS errors before committing)
```

## Git & GitHub

- Remote: `https://github.com/Tesfamichael/claude_code_projects`
- Each feature lives on its own branch (e.g. `feature-data-export-v1`)
- **Required workflow for every change — always do all three steps:**
  ```bash
  git add <files>
  git commit -m "describe the change"
  git push origin <current-branch>
  ```
- **Never rely on the post-commit hook alone to push.** Always run `git push` explicitly after every commit.
- Verify success: after pushing, `git status` should show "Your branch is up to date with 'origin/...'". If it says "ahead by N commits", the push did not happen.

## Branch Structure

| Branch | Purpose |
|---|---|
| `expense-tracker-ai` | Original clean app (no export feature) |
| `feature-data-export-v1` | Simple one-button CSV export |
| `feature-data-export-v2` | Advanced modal: multi-format, filters, preview |
| `feature-data-export-v3` | Cloud Export Hub: templates, history, scheduling |

## Export Feature Notes

- The base `useExpenses` hook already contains a basic `exportCSV` — new export features should go in `lib/exporters.ts` or `lib/cloudExport.ts`, not in the hook.
- See `code-analysis.md` (on `feature-data-export-v3`) for a full comparison of the three export implementations and a recommendation for the production hybrid approach.
