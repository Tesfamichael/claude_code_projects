# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio/profile site for Tesfamichael — a single-page static HTML site with no build step, no dependencies, and no frameworks.

## Architecture

Everything lives in `index.html` — HTML structure, CSS (in `<style>`), and JavaScript (in `<script>`) are all co-located in one file. There is no separate CSS or JS file.

**Key sections in `index.html`:**
- **Hero** — avatar + name + tagline
- **About** — bio paragraph
- **Projects** — list of `.project-card` anchor elements linking to external projects
- **Contact** — form with client-side only submit handler (no backend, just shows a success message)
- **Footer** — copyright + email

**CSS approach:** CSS custom properties (`--bg`, `--accent`, `--radius`, etc.) defined on `:root` for theming. Mobile responsiveness handled via a single `@media (max-width: 480px)` breakpoint.

## Deployment

Static file — open `index.html` directly in a browser. No server needed.

## Git & GitHub

- Remote: `https://github.com/Tesfamichael/claude_code_projects`
- Branch: `main`
- A `post-commit` hook exists but **must not be relied upon** — always explicitly push after every commit.
- **Required workflow for every change:**
  ```bash
  git add .
  git commit -m "describe the change"
  git push origin main
  ```
- Never assume a commit reached GitHub without running `git push` explicitly. Verify with `git status` — if the branch shows "ahead of origin" it has not been pushed.

## GitHub Actions

Two workflows are configured in `.github/workflows/`:

- **`claude.yml`** — Triggers Claude Code on issues/PRs when `@claude` is mentioned in comments or issue body.
- **`claude-code-review.yml`** — Auto-runs Claude code review on every PR. Requires `CLAUDE_CODE_OAUTH_TOKEN` secret set in the repo settings.
