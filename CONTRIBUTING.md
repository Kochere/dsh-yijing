# Contributing

Thanks for taking the time. This is a small, dependency-free DSH bundle; keep changes focused and testable.

## Setup

```bash
git clone https://github.com/Kochere/dsh-yijing.git
cd dsh-yijing
node --test "test/*.test.mjs"
```

There are no runtime dependencies and no build step. Node 20+ is enough.

## What to run before a PR

```bash
node --test "test/*.test.mjs"     # 27 tests
node --check index.js
node --check client.js
```

If you touch the bundled text:

```bash
node scripts/fetch-sources.mjs    # downloads the three transcriptions (network)
node scripts/build-data.mjs       # writes lib/hexagrams.json and prints the audit
```

The build asserts every correction’s old string, so a silent text drift fails the build. Commit `lib/hexagrams.json` and `scripts/out-audit.json` together with any override change; never hand-edit the generated JSON.

If you touch the card:

```bash
node scripts/preview-ui.mjs       # writes .out/preview-*.html
```

Open the generated pages in a browser, or use the headless-browser flow described in `docs/GITHUB.md`. Keep the card keyboard-accessible and respect `prefers-reduced-motion`.

## Scope

- **In scope:** classical text accuracy, change-rule correctness, cast-card rendering, CLI, docs, tests, accessibility.
- **Out of scope (for now):** 六爻纳甲/六亲/世应, vernacular translations stored in the data, non-canonical divination methods, network services.

## Adding or changing a correction

1. Edit the `OVERRIDES` table in `scripts/build-data.mjs`; each entry is `[number, field, index, from, to]`.
2. `from` must be the exact current string; the build fails if it does not match.
3. Rebuild, inspect `scripts/out-audit.json`, and add a line to `docs/SOURCES.md` if the change is user-visible.
4. Add or adjust a test if the correction affects the public output.

## PR checklist

- [ ] Tests pass.
- [ ] `lib/hexagrams.json` and `scripts/out-audit.json` regenerated if text changed.
- [ ] README/docs updated for user-visible changes.
- [ ] No new runtime dependency without a clear reason.
- [ ] Card changes verified in light and dark, at 36/72/144 px where relevant.
