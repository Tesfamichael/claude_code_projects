Please clean up the git branches and worktrees in this expense tracker project.

**1. Audit Current State**
- Run `git worktree list` — list all worktrees with their branch and commit
- Run `git branch -a` — list all local and remote branches
- Run `git log --oneline -1` for each local branch to show the last commit date and message

**2. Identify Candidates for Cleanup**
Flag branches that match any of these criteria:
- Already merged into `expense-tracker-ai` (the main baseline branch)
- Have no corresponding remote branch (local only, never pushed)
- Have not had a commit in over 30 days
- Are worktree branches where the worktree folder no longer exists on disk

Do NOT flag branches that:
- Are currently checked out in any worktree
- Are listed in CLAUDE.md as active feature branches
- Are `main`, `expense-tracker-ai`, or any `integration/*` branch

**3. Confirm Before Deleting**
List all candidates clearly with the reason for deletion. Ask for confirmation before taking any destructive action.

**4. Cleanup (after confirmation)**
For each approved branch:
- If it has an associated worktree: `git worktree remove <path>` first
- Delete the local branch: `git branch -d <branch>` (use `-D` only if explicitly approved)
- Delete the remote branch: `git push origin --delete <branch>`

**5. Final State**
- Run `git worktree list` and `git branch -a` again to show the clean state
- Update the Branch Structure table in CLAUDE.md to remove deleted branches
- Commit and push the CLAUDE.md update: `docs: update CLAUDE.md after branch cleanup`

Report a before/after summary of branches and worktrees removed.
