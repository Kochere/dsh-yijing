# Changelog

## 1.0.0 — 2026-11-17

First public release.

### Added

- **Host plugin** with two tools:
  - `yijing_cast` — three-coin method, six lines, 本卦/之卦/动爻, and the ruling text selected by Zhu Xi’s 《易学启蒙·考变占》 rule (0–6 moving lines, including 乾用九 / 坤用六).
  - `yijing_hexagram` — one hexagram by number, name, symbol or six-bit code; `detail: "full"` adds 小象、用九用六 and 乾/坤 文言.
- **Client plugin** — an animated cast card rendered from a `yijing` fence in the answer: three coins flip, six lines draw bottom-to-top, 本卦 → 之卦 settles. Theme-aware, reduced-motion aware, replayable, and it replays once when it first scrolls into view. A malformed cast shows a visible error card instead of blanking the tool row.
- **Bundled Zhouyi text** — 64 hexagrams, 384 lines, 用九/用六, 乾/坤 文言; classical text only.
- **Audited data build** — 58 corrections against the 1715 武英殿 edition of 《御纂周易折中》, 2 documented variants; every correction asserts its old string.
- **CLI** — `node bin/yijing.mjs cast|hexagram`, with `--values` for replay and `--json`.
- **Tests** — 27 tests over data integrity, coin distribution, hexagram derivation, all seven change-rule branches, formatting, and the client card.
- **Docs** — provenance, a worked reading, plugin detail page, GitHub launch notes.

### Notes

- Runtime has no network calls and no dependencies; randomness uses `node:crypto`.
- The plugin does not ship a vernacular translation. The model quotes the classical text and explains it in the user’s language.
- Three moving lines follow the simpler 本卦为主 reading of Zhu Xi’s 前十卦主贞 / 后十卦主悔 distinction; the result says so.
