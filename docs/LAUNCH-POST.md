# Launch post (draft)

A ready-to-edit post for a blog, a forum, or a “show your project” thread. It leads with the auditable text, not with “I made a divination app”.

---

## I checked 384 I Ching line texts against a 1715 edition. Here are the 58 errors.

I built a small divination plugin for DeepSeek Harness. The interesting part was not the animation; it was discovering that the text most people copy around is not the text that was printed.

The received *Zhouyi* has 64 hexagrams and 384 line statements, plus 用九/用六. I took a widely used simplified, punctuated transcription as the base, then compared every line against a scan-reviewed transcription of the **1715 武英殿 edition of 《御纂周易折中》** (Zenodo record 23298982), and cross-checked 彖/象/文言 against a second open dataset.

The base was not bad — but it had exactly the kind of errors that survive copying:

- **大有 六二** carried the text of 同人 六二 (“同人于宗，吝”) instead of “大车以载，有攸往，无咎”.
- **姤 九五** had its whole sentence duplicated.
- **复 初九** read “不复远” instead of “不远复”.
- **震 大象** read “虩雷，震；君子以恐惧修身” instead of “洊雷，震；君子以恐惧修省”.
- **蒙 六三** had 娶女 for 取女; **大过 九五** was missing 其; **晋 九四** had 硕鼠 for 鼫鼠.

In total: **58 corrections**, and 2 genuine edition variants left documented (革 六二 己日/已日; 中孚 初九 有它/有他). Every correction is asserted against the old string at build time, and CI rebuilds the JSON and fails if the output drifts. The full list and sources are in the repo.

### Why a plugin?

Because a divination is a good test of an agent tool: the tool must do the mechanical part honestly (coins, moving lines, which text is ruling), and then stop. The model should not invent a hexagram, and it should not pretend a modern paraphrase is scripture.

So the plugin returns **only the classical text** — 卦辞、彖、大象、爻辞、小象、用九用六、乾坤文言 — plus the ruling passage chosen by Zhu Xi’s 《易学启蒙·考变占》 for 0–6 moving lines. The agent quotes it, explains it in plain language, and answers the question.

The chat gets an animated cast card: three coins flip, six lines draw bottom-to-top, 本卦 → 之卦. No network, no dependencies, local randomness.

### Try it

```bash
git clone https://github.com/Kochere/dsh-yijing.git
```

Then in DSH: Plugins → Add plugin → select the directory. Ask a question.

If you only care about the text, `lib/hexagrams.json` is a plain, auditable 64/384 dataset; the build script and the correction table are in `scripts/`.

### What I’d like feedback on

- Any remaining textual variants, especially in 彖/象 where the two sources disagree.
- Whether the 变占 rule should expose the 前十卦主贞 / 后十卦主悔 refinement for three moving lines.
- The card’s readability at small widths.

---

## Short version (for a show-and-tell thread)

> I built an I Ching coin oracle for DeepSeek Harness. The tool casts six lines, derives 本卦/之卦/动爻, and returns only the classical Zhouyi text selected by Zhu Xi’s change rule — no vernacular, no invented lines. The chat shows an animated cast card. I also audited all 384 line texts against a 1715 edition and fixed 58 errors; the build asserts every correction. MIT, zero deps, no network. Repo: github.com/Kochere/dsh-yijing

## Chinese short version

> 给 DeepSeek Harness 做了一个金钱卦插件：三枚铜钱六掷，定本卦、之卦、动爻，按朱子《易学启蒙·考变占》取卦爻辞；只给《周易》古文，解卦由模型先引原文、再讲白话。聊天里有一张会动的起卦卡。顺手把 384 条爻辞与 1715 年武英殿本《御纂周易折中》对校，订正 58 处，构建时逐条断言旧文。MIT、零依赖、不联网。仓库：github.com/Kochere/dsh-yijing

## Posting notes

- Lead with the audit, not the mysticism; the audit is the part engineers can check.
- Put the GIF and one screenshot in the post; link the repo once at the end.
- Do not claim “the most accurate edition”; say what was compared and where the variants remain.
- Reply to corrections with the source page, not defensiveness. A documented variant is a feature.
