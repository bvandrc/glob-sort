# npm publishing conventions

For repos that publish a package to npm, whatever the package is written in.

- **Releasing**: Bump `version` in `package.json`, merge, then publish a GitHub release tagged `v<version>`. `.github/workflows/release.yml` checks the tag matches and runs `pnpm stage publish` with provenance, which stages the version: approve it on npmjs.com with 2FA to publish it.
  - **Never publish from a machine**: a local `npm publish` skips the tag and provenance, and leaves no GitHub release behind the version.
- **Trusted publishing, no token**: npm trusts the workflow's OIDC token (`id-token: write`), set up as a trusted publisher in the package's npm settings. No `NPM_TOKEN` secret; never add one.
- **`package.json`**
  - **`publishConfig`**: `"access": "public"` and `"provenance": true`.
  - **`repository`**: The GitHub repo the release runs in, or npm rejects the provenance statement.
  - **`files`**: An allowlist of what ships (usually just `dist`), never an `.npmignore` blocklist.
  - **`sideEffects`**: Always set: `false` if no module does anything on import, otherwise the list of files that do.
  - **`prepublishOnly`**: The repo's check, tests, and build, in that order. The release workflow relies on it rather than repeating them.
- **Release notes are the changelog**: Write what changed for consumers on the GitHub release. No `CHANGELOG.md`.
- **Versioning**: semver against the public API: what the entrypoints export, and anything else a consumer can observe, such as the shape of data it persists.
