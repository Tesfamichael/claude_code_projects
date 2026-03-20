I want to add a new feature to the expense tracker: $ARGUMENTS

Please scaffold this feature end-to-end following the project conventions in CLAUDE.md:

**1. Planning**
- Clarify the feature scope if $ARGUMENTS is vague — describe what you will and will not build
- Identify which existing files will be modified and what new files will be created
- Flag any conflicts with known issues listed in CLAUDE.md before writing any code

**2. Branch Setup**
- Derive a kebab-case branch name from the feature description (e.g. "dark mode" → `feature/dark-mode`)
- Create and checkout the branch: `git checkout -b feature/<name> expense-tracker-ai`
- Confirm the branch is clean before writing any code

**3. Implementation**
Follow these project conventions strictly:
- New types go in `types/expense.ts`
- New constants (categories, colors, keys) go in `lib/constants.ts`
- New pure utility functions go in `lib/utils.ts`
- New localStorage keys must be documented in CLAUDE.md under the localStorage Keys table
- All new components require `'use client'` at the top
- Dynamic category colors must use `style={{ backgroundColor: color }}` not Tailwind className
- `setTimeout` callbacks that set state need cleanup via `useRef` + `clearTimeout` in useEffect return
- No component should read from `localStorage` directly — use hooks

**4. Build Verification**
- Run `npm run build` — fix all TypeScript errors before committing
- Run `npm run lint` — fix all lint errors before committing

**5. Commit and Push**
- Stage only the files related to this feature
- Commit with message: `feat: <description>`
- Push: `git push origin feature/<name>`
- Confirm with `git status` that the branch is up to date with origin

**6. CLAUDE.md Update**
- Add the new branch to the Branch Structure table in CLAUDE.md
- Add any new localStorage keys to the localStorage Keys table
- Commit and push the CLAUDE.md update separately: `docs: update CLAUDE.md for <feature>`

Report what was built, what files were created or modified, and the branch name to use for future reference.
