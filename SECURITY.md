# Security

## Runtime behavior

- The plugin makes **no network requests** at runtime.
- Randomness uses `node:crypto` on the local machine.
- The question and the cast are part of the DSH session; the plugin does not send them anywhere.
- No telemetry, no analytics, no remote configuration.

The only network use in this repository is the optional `scripts/fetch-sources.mjs`, which downloads the public transcriptions used to rebuild `lib/hexagrams.json`.

## Reporting

If you find a vulnerability, please open a private security advisory on GitHub (Security → Report a vulnerability) rather than a public issue. Include the version, a minimal reproduction, and the impact.

## Supported versions

Only the latest minor release is supported.
