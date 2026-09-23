# General conventions

Applies to every repo, independent of language or framework.

## Git and pull requests

- **Branches**
  - **Naming**: Name work branches `<type>/<slug>`, where `<type>` is a Conventional Commits type — `feat`, `fix`, `chore`, `refactor`, `ci`, `docs`, `style`, `test`, `perf`, or `build` — and `<slug>` is a short kebab-case description of the change. Never use a `claude/` prefix or a random session suffix.
  - **Renaming an assigned branch**: The naming rule above overrides the branch name a session is assigned by default — if you were given one, rename it before the first push.
- **PR review threads**: Always reply on the thread with what changed (or why it wasn't changed), then mark the thread resolved. Do this for every thread you act on, not just the ones that needed discussion.

## Tooling and dependencies

- **Formatting**: Run the repo's `format` script after making edits and before every commit, using whichever package manager the repo uses (`npm run format`, `pnpm run format`, ...).
- **Dependency ranges**: Unless instructed otherwise, write the caret range down to the axis that semver treats as breaking, and no further — `^8` for a 1.0+ package, `^0.45` for a 0.x one, where the minor is that axis, unless it has been explicitly found that a minimum minor or patch version is needed. Installers write the full `^8.23.1` by default; trim it. The lockfile is what pins the build, so the extra precision only claims a floor that was never actually established.

## Testing

- **Unit vs end-to-end**: Where a repo has both, a pure function's edge cases belong in its unit test rather than an end-to-end run — especially ones that would need a large setup to reach through the UI. End-to-end keeps the wiring: that the UI calls the function and renders what it returns. A case whose return value changes what the user actually sees, in a way worth pinning down, still earns an end-to-end test of its own.
- **Testing internals**: Never widen a module's API for a test. Where something is only public so a test file can reach it, keep it internal and drive it through the public thing that uses it — the test then pins behaviour someone can actually depend on, and survives the internal being renamed or absorbed. A repo's test-support module is the exception: being imported by tests is its whole job.

## Comments

- **Where a comment goes**: A doc comment (i.e., above a function) is for *callers* — what the thing is/does, what it gives back, what it costs them, etc. Any note about *how* it does that, or explaining a cast, a workaround, or a library's behaviour, etc., goes in a line comment *within* the function *at* the code it describes, since it doesn't need to be known to the caller. This goes for any function, internal to a file or exported.
- **Doc comment shape**: A doc comment that runs to more than one line opens with its summary alone — what the thing is, usually one sentence — then a blank line before any specifics: conditions, defaults, the reason it's built the way it is. A comment that is only a summary, however many lines it wraps to, needs no gap.

## Writing

- **Oxford comma**: A list of three or more takes a comma before its final `and` or `or` — in prose, comments, documentation, and commit messages alike.
- **Markdown**: Don't hard-wrap prose. Keep each paragraph, list item, and table row on one line and let the editor wrap it. Manual line breaks mean a one-word edit reflows the whole block, so the diff shows a rewritten paragraph instead of the words that actually changed.
