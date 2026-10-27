# npm publishing conventions

For repos that publish a package to npm, whatever the package is written in.

- **Releasing**: Bump `version` in `package.json`, merge, then publish a GitHub release tagged `v<version>`. `.github/workflows/release.yml` checks the tag matches and runs `pnpm stage publish` with provenance, which leaves the version staged: approve it on npmjs.com with 2FA to publish it.
  - **Never publish from a machine**: a local `npm publish` skips the tag and the provenance statement, and leaves the npm version with no GitHub release to point back at.
  - **The release workflow is one file, copied whole**: every package carries the same `release.yml`, so a change to it (an action version, a step) goes to all of them at once rather than drifting per repo.
- **Trusted publishing, no token**: npm authenticates the workflow through GitHub's OIDC token (`id-token: write`), configured as a trusted publisher on the package's npm settings page. There is no `NPM_TOKEN` secret to store or rotate, and none should be added.
- **`package.json`**
  - **`publishConfig`**: `"access": "public"` and `"provenance": true`, so the settings hold whatever command does the publishing.
  - **`repository`**: Must name the GitHub repo the release runs in — npm rejects a provenance statement whose source repo doesn't match it.
  - **`files`**: An allowlist of what ships (usually `dist` and little else), never an `.npmignore` blocklist, so a new top-level file stays out of the tarball until someone decides it belongs there.
  - **`prepublishOnly`**: Runs the repo's check, its tests, and its build, in that order. It is the last gate before a version is staged, and the release workflow relies on it rather than repeating those steps.
- **Release notes are the changelog**: write what changed for consumers on the GitHub release itself. No `CHANGELOG.md` alongside it — two copies of the same history drift.
- **Versioning**: semver against the package's public API — what its entrypoints export, and anything else a consumer can observe, such as the shape of data it persists. Removing or renaming an export is a breaking change and needs a major bump.
