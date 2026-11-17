# GitHub launch kit

This file is for the maintainer. It contains the repository settings, release copy and a realistic first-week checklist. Replace `Kochere` if that is not your GitHub handle.

## Repository settings

| Field | Value |
|---|---|
| Name | `dsh-yijing` |
| Description | `I Ching coin oracle for DeepSeek Harness — animated cast, Zhu Xi’s change rule, classical Zhouyi text only.` |
| Website | leave empty, or a short demo page |
| Topics | `dsh`, `deepseek-harness`, `iching`, `zhouyi`, `divination`, `classical-chinese`, `plugin`, `javascript`, `agent-tools` |
| Social preview | `docs/social-preview.png` (1280×640) |
| License | MIT |
| Default branch | `main` |

## Suggested first release

Tag `v1.0.0`, title `v1.0.0 — the cast, the text, the card`, body:

```markdown
First public release.

- `yijing_cast`: three-coin method, 本卦/之卦/动爻, and the ruling text chosen by Zhu Xi’s 《易学启蒙·考变占》.
- `yijing_hexagram`: 64 hexagrams by number, name, symbol or six-bit code; full 小象/文言 when asked.
- Animated cast card in the chat: coins, six lines, primary → changed hexagram.
- 64/384 + 用九/用六 + 乾/坤 文言, audited against the 1715 武英殿 edition (58 corrections, 2 documented variants).
- Zero runtime dependencies, no network, local randomness.
- 27 tests; data rebuild is reproducible in CI.

Install: clone, then Plugins → Add plugin → select the directory. See README.
```

## What actually earns stars (in order)

1. **A 3-second first screen.** The GIF must show a divination, not a file tree. Keep it above the fold; it already is.
2. **One sharp differentiator.** “Only classical text; the model interprets” is the line. Repeat it in the repo description, the first paragraph and the release notes.
3. **Proof, not vibes.** The 58 corrections and the audit are the unusual part. A short post — “I checked 384 line texts against a 1715 edition; here are the 58 errors” — travels further than a generic “I made an I Ching plugin”.
4. **A low-friction install.** One clone + one directory pick. Do not require npm publish first.
5. **A living issue tracker.** Reply to the first ten issues; add a `good first issue` or two.
6. **Post where the audience already is.** DSH/agent-tool communities, Chinese classics/易学 communities, and one “show your project” thread. One substantive post per place; no drive-by spam, no star-for-star.
7. **Do not buy or bot stars.** It poisons the only signal that matters.

## First-week checklist

- [ ] Create the repo, push `main`.
- [ ] Upload `docs/social-preview.png` in Settings → Social preview.
- [ ] Add the topics above.
- [ ] Cut `v1.0.0` with the notes above.
- [ ] Pin an issue: “Show a cast you found interesting” (optional, invites participation).
- [ ] Post the text-audit note with two screenshots (card light + dark).
- [ ] Ask 3–5 people to try the install and report friction; fix the first blocker.
- [ ] Add a `CHANGELOG` entry for anything fixed in week one.

## Honest expectation

A niche divination plugin for one agent harness will not go viral. A realistic ceiling in the first months is tens to low hundreds of stars, driven by the demo GIF and the text-audit story. The path to more is not more badges; it is a second post that teaches something (“how the 变占 rule picks the line”) and a plugin that keeps working across DSH releases.

## Preview the repository page locally

`preview/github.html` is a GitHub-like mock rendered from `README.md`; it is not GitHub and the counts are illustrative.

```bash
npm i marked                       # dev-only, for the mock renderer
node scripts/preview-github.mjs    # writes preview/github.html
```

Screenshot it with any headless Chromium (the committed images use Edge on macOS):

```bash
"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
  --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=1440,4600 \
  --screenshot=preview/github-full.png \
  "file://$PWD/preview/github.html"
```

The above-the-fold and README-hero crops in `preview/` are made from that screenshot. The social preview is generated from `preview/social-preview.html` at 1280×640.

The long-form launch draft is in [LAUNCH-POST.md](LAUNCH-POST.md); the short version is at the bottom of that file.
