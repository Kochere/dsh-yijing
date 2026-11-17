#!/usr/bin/env node
/**
 * Builds lib/hexagrams.json from the vendored transcriptions.
 *
 * Base text:   Classical-Chinese-Text-Dataset (wangxb96) yijing_V2.1.json
 *              simplified, punctuated, 64 gua with 卦辞/彖/大象/爻辞/小象.
 * Line audit:  御纂周易折中 武英殿刊本 (1715) 爻辞转录, Zenodo 23298982
 *              (traditional, unpunctuated, scan-reviewed) — used to correct
 *              the base text. Every correction below asserts the old string.
 * Struct audit: open-iching (john-walks-slow) tuan/xiang/wen for 彖/象/文言.
 *
 * Run: node scripts/build-data.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const read = (p) => JSON.parse(fs.readFileSync(path.join(here, p), 'utf8'))

/* --------------------------------------------------------------- conversion */

// Only 31 characters in this corpus differ between the traditional sources and
// simplified output. The table is explicit so no automatic conversion can
// silently damage classical forms. 乾 (qián) stays 乾; 噬乾胏/肉 is gān → 干.
const CONV = {
  乾: '乾', 亂: '乱', 來: '来', 係: '系', 內: '内', 則: '则', 實: '实', 師: '师',
  彙: '汇', 復: '复', 撝: '撝', 歸: '归', 繻: '繻', 纆: '纆', 艱: '艰', 萬: '万',
  豶: '豮', 貞: '贞', 財: '财', 輔: '辅', 遺: '遗', 鄰: '邻', 長: '长', 陰: '阴',
  陽: '阳', 際: '际', 順: '顺', 顒: '颙', 願: '愿', 餗: '餗', 馮: '冯', 遯: '遁',
}
const conv = (s) => String(s || '')
  .replace(/噬乾胏/g, '噬干胏')
  .replace(/噬乾肉/g, '噬干肉')
  .replace(/[乾亂來係內則實師彙復撝歸繻纆艱萬豶貞財輔遺鄰長陰陽際順顒願餗馮遯]/g, (c) => CONV[c])

/* ---------------------------------------------------------------- overrides */
// [number, field, lineIndex?, from, to]
const OVERRIDES = [
  // 爻辞 — corrected against 折中
  [4, 'yao', 2, '六三：勿用娶女；见金夫，不有躬，无攸利。', '六三：勿用取女；见金夫，不有躬，无攸利。'],
  [8, 'yao', 0, '初六：有孚，比之，无咎。有孚盈缶，终来有他，吉。', '初六：有孚，比之，无咎。有孚盈缶，终来有它，吉。'],
  [10, 'yao', 3, '九四：履虎尾，诉诉，终吉。', '九四：履虎尾，愬愬，终吉。'],
  [13, 'yao', 4, '九五：同人，先号啕而后笑。大师克相遇。', '九五：同人，先号咷而后笑。大师克相遇。'],
  [14, 'yao', 1, '六二：同人于宗，吝。', '六二：大车以载，有攸往，无咎。'],
  [14, 'yao', 5, '上九：自天佑之，吉无不利。', '上九：自天祐之，吉无不利。'],
  [24, 'yao', 0, '初九：不复远，无祗悔，元吉。', '初九：不远复，无祗悔，元吉。'],
  [25, 'yao', 1, '六二：不耕获，不灾畲，则利有攸往。', '六二：不耕获，不菑畬，则利有攸往。'],
  [28, 'yao', 4, '九五：枯杨生华，老妇得士夫，无咎无誉。', '九五：枯杨生华，老妇得其士夫，无咎无誉。'],
  [29, 'yao', 5, '上六：系用徽纆，置于丛棘，三岁不得，凶。', '上六：系用徽纆，寘于丛棘，三岁不得，凶。'],
  [36, 'yao', 3, '六四：入于左腹，获明夷之心，出于门庭。', '六四：入于左腹，获明夷之心，于出门庭。'],
  [37, 'yao', 4, '九五：王假有家，勿恤，往吉。', '九五：王假有家，勿恤，吉。'],
  [41, 'yao', 0, '初九：巳事遄往，无咎，酌损之。', '初九：已事遄往，无咎，酌损之。'],
  [41, 'yao', 5, '上九：弗损益之，无咎，贞吉，有攸往，得臣无家。', '上九：弗损益之，无咎，贞吉，利有攸往，得臣无家。'],
  [44, 'yao', 0, '初六：系于金柅，贞吉，有攸往，见凶，羸豕孚踟躅。', '初六：系于金柅，贞吉，有攸往，见凶，羸豕孚蹢躅。'],
  [44, 'yao', 4, '九五：以杞包瓜，含章，有陨自天。九五：以杞包瓜，含章，有陨自天。', '九五：以杞包瓜，含章，有陨自天。'],
  [35, 'yao', 3, '九四：晋如硕鼠，贞厉。', '九四：晋如鼫鼠，贞厉。'],
  [47, 'yao', 1, '九二：困于酒食，朱绂方来，利用享祀，征凶，无咎。', '九二：困于酒食，朱绂方来，利用亨祀，征凶，无咎。'],
  [48, 'yao', 4, '九五：井冽，寒泉食。', '九五：井洌，寒泉食。'],
  [49, 'yao', 1, '六二：巳日乃革之，征吉，无咎。', '六二：己日乃革之，征吉，无咎。'],
  [52, 'yao', 2, '九三：艮其限，列其夤，厉薰心。', '九三：艮其限，列其夤，厉熏心。'],
  [55, 'yao', 2, '九三：丰其沛，日中见沫，折其右肱，无咎。', '九三：丰其沛，日中见沬，折其右肱，无咎。'],
  [55, 'yao', 5, '上六：丰其屋，蔀其家，闚其户，阒其无人，三岁不觌，凶。', '上六：丰其屋，蔀其家，窥其户，阒其无人，三岁不觌，凶。'],
  [56, 'yao', 5, '上九：鸟焚其巢，旅人先笑后号啕。丧牛于易，凶。', '上九：鸟焚其巢，旅人先笑后号咷。丧牛于易，凶。'],
  // 卦辞
  [49, 'gua', undefined, '革：巳日乃孚，元亨利贞，悔亡。', '革：己日乃孚，元亨利贞，悔亡。'],
  [57, 'gua', undefined, '巽：小亨，利攸往，利见大人。', '巽：小亨，利有攸往，利见大人。'],
  // 彖传
  [1, 'tuan', undefined, '大明始终', '大明终始'],
  [4, 'tuan', undefined, '初噬告，以刚中也', '初筮告，以刚中也'],
  [25, 'tuan', undefined, '天命不佑，行矣哉？', '天命不祐，行矣哉？'],
  [28, 'tuan', undefined, '大过之时义大矣哉！', '大过之时大矣哉！'],
  [29, 'tuan', undefined, '坎之时用大矣哉！', '险之时用大矣哉！'],
  [49, 'tuan', undefined, '巳日乃孚；革而信也。', '己日乃孚，革而信之。'],
  [62, 'tuan', undefined, '有飞鸟之象焉，有飞鸟遗之音', '有飞鸟之象焉，飞鸟遗之音'],
  // 大象
  [10, 'daxiang', undefined, '君子以辨上下，安民志。', '君子以辨上下，定民志。'],
  [23, 'daxiang', undefined, '山附地上，剥；', '山附于地，剥；'],
  [34, 'daxiang', undefined, '君子以非礼勿履。', '君子以非礼弗履。'],
  [51, 'daxiang', undefined, '虩雷，震；君子以恐惧修身。', '洊雷，震；君子以恐惧修省。'],
  [63, 'daxiang', undefined, '君子以思患而预防之。', '君子以思患而豫防之。'],
  // 小象
  [2, 'xiao', 5, '战龙于野，其道穷也。', '龙战于野，其道穷也。'],
  [3, 'xiao', 2, '即鹿无虞，以纵禽也。君子舍之，往吝穷也。', '即鹿无虞，以从禽也。君子舍之，往吝穷也。'],
  [4, 'xiao', 2, '勿用娶女，行不顺也。', '勿用取女，行不顺也。'],
  [5, 'xiao', 1, '需于沙，衍在中也。虽小有言，以终吉也。', '需于沙，衍在中也。虽小有言，以吉终也。'],
  [6, 'xiao', 1, '不克讼，归而逋也。自下讼上，患至掇也。', '不克讼，归逋，窜也。自下讼上，患至掇也。'],
  [8, 'xiao', 0, '比之初六，有他吉也。', '比之初六，有它吉也。'],
  [10, 'xiao', 3, '诉诉终吉，志行也。', '愬愬终吉，志行也。'],
  [14, 'xiao', 3, '匪其彭，无咎；明辨晰也。', '匪其彭，无咎；明辨晢也。'],
  [14, 'xiao', 5, '大有上吉，自天佑也。', '大有上吉，自天祐也。'],
  [18, 'xiao', 4, '干父之蛊；承以德也。', '干父用誉；承以德也。'],
  [35, 'xiao', 1, '受之介福，以中正也。', '受兹介福，以中正也。'],
  [35, 'xiao', 3, '硕鼠贞厉，位不当也。', '鼫鼠贞厉，位不当也。'],
  [41, 'xiao', 0, '巳事遄往，尚合志也。', '已事遄往，尚合志也。'],
  [41, 'xiao', 4, '六五元吉，自上佑也。', '六五元吉，自上祐也。'],
  [43, 'xiao', 1, '莫夜有戎，得中道也。', '有戎勿恤，得中道也。'],
  [52, 'xiao', 2, '艮其限，危薰心也。', '艮其限，危熏心也。'],
  [53, 'xiao', 1, '饮食衎衎，吉，不素饱也。', '饮食衎衎，不素饱也。'],
  [55, 'xiao', 5, '丰其屋，天际翔也。闚其户，阒其无人，自藏也。', '丰其屋，天际翔也。窥其户，阒其无人，自藏也。'],
  [60, 'xiao', 1, '不出门庭，失时极也。', '不出门庭，凶，失时极也。'],
  [61, 'xiao', 2, '可鼓或罢，位不当也。', '或鼓或罢，位不当也。'],
]

/* ------------------------------------------------------------------ sources */

const base = read('vendor/wangxb.json') // 王弼本/通行本, simplified
const wuying = read('vendor/wuying.json') // 折中 武英殿本 爻辞 (traditional)
const open = read('vendor/open-iching.json') // structural cross-check
const wen = read('vendor/wen.json') // 文言传 (traditional)

const TRIGRAMS = {
  '111': ['乾', '天', '☰'], '110': ['兑', '泽', '☱'], '101': ['离', '火', '☲'], '100': ['震', '雷', '☳'],
  '011': ['巽', '风', '☴'], '010': ['坎', '水', '☵'], '001': ['艮', '山', '☶'], '000': ['坤', '地', '☷'],
}
const LINE_NAMES = (bits) => bits.map((b, i) => {
  const num = ['初', '二', '三', '四', '五', '上'][i]
  const yy = b ? '九' : '六'
  return i === 0 ? `初${yy}` : i === 5 ? `上${yy}` : `${yy}${num}`
})

/* ------------------------------------------------------------------- build */

const hexagrams = []
const errors = []
const applied = new Set()

function applyOverrides(num, field, index, value) {
  for (const [n, f, i, from, to] of OVERRIDES) {
    if (n !== num || f !== field) continue
    if (f === 'yao' || f === 'xiao') { if (i !== index) continue }
    if (value !== from && !value.includes(from)) continue
    applied.add(`${n}:${f}:${i ?? ''}`)
    return value.split(from).join(to)
  }
  return value
}

for (let i = 0; i < 64; i++) {
  const src = base[i]
  const number = i + 1
  const alt = { 29: '习坎', 33: '遁' }[number]
  if (src.name !== open[i].name && open[i].name !== alt) errors.push(`order mismatch at ${number}: ${src.name} vs ${open[i].name}`)

  const bits = src.id.split('').map(Number) // bottom -> top
  if (bits.length !== 6) errors.push(`bad id ${src.name}`)
  const lower = TRIGRAMS[bits.slice(0, 3).join('')]
  const upper = TRIGRAMS[bits.slice(3).join('')]
  if (!lower || !upper) errors.push(`bad trigram ${src.name}`)

  const fullName = lower[0] === upper[0]
    ? `${lower[0]}为${lower[1]}`
    : `${upper[1]}${lower[1]}${src.name}`

  let guaCi = applyOverrides(number, 'gua', undefined, src.gua_ci).trim()
  guaCi = guaCi.replace(new RegExp(`^${src.name}[：:，,]\\s*`), '')
  if (!guaCi.endsWith('。')) guaCi += '。'

  const tuan = applyOverrides(number, 'tuan', undefined, src.tuan_ci).trim()
  const daXiang = applyOverrides(number, 'daxiang', undefined, src.da_xiang).trim()

  const names = LINE_NAMES(bits)
  const lines = []
  for (let k = 0; k < 6; k++) {
    let text = applyOverrides(number, 'yao', k, src.yao_ci[k]).trim()
    const prefix = text.match(/^\S{2}[：:，,]\s*/)
    if (prefix) text = text.slice(prefix[0].length)
    else errors.push(`line ${number}.${k + 1} lacks a line-name prefix`)
    if (!text.endsWith('。')) text += '。'
    let xiang = applyOverrides(number, 'xiao', k, src.xiao_xiang[k]).trim()
    if (!xiang.endsWith('。')) xiang += '。'
    lines.push({ pos: k + 1, name: names[k], yin: bits[k] === 0, text, xiang })
  }

  let special
  if (src.yao_ci[6]) {
    let text = src.yao_ci[6].replace(/^用[九六][：:，,]\s*/, '').trim()
    if (!text.endsWith('。')) text += '。'
    let xiang = (src.xiao_xiang[6] || '').trim()
    if (xiang && !xiang.endsWith('。')) xiang += '。'
    special = { name: bits.every(Boolean) ? '用九' : '用六', text, xiang }
  }

  hexagrams.push({
    number,
    name: src.name,
    fullName,
    symbol: String.fromCodePoint(0x4dc0 + i),
    bits,
    lower: { name: lower[0], nature: lower[1], symbol: lower[2], bits: bits.slice(0, 3) },
    upper: { name: upper[0], nature: upper[1], symbol: upper[2], bits: bits.slice(3) },
    guaCi: conv(guaCi),
    tuan: conv(tuan),
    daXiang: conv(daXiang),
    lines: lines.map((l) => ({ ...l, text: conv(l.text), xiang: conv(l.xiang) })),
    ...(special ? { special: { ...special, text: conv(special.text), xiang: conv(special.xiang) } } : {}),
    ...(wen[`iching__${number}`] ? { wenyan: conv(wen[`iching__${number}`]) } : {}),
  })
}

for (const o of OVERRIDES) {
  const key = `${o[0]}:${o[1]}:${o[2] ?? ''}`
  if (!applied.has(key)) errors.push(`override did not apply: ${key} (${o[3].slice(0, 24)}…)`)
}
if (errors.length) {
  console.error('BUILD FAILED:\n' + errors.join('\n'))
  process.exit(1)
}

/* --------------------------------------------------------------- validation */

const byNumber = new Map(hexagrams.map((h) => [h.number, h]))
const seen = new Set()
const warnings = []
for (const h of hexagrams) {
  if (seen.has(h.symbol)) warnings.push(`duplicate symbol ${h.symbol}`)
  seen.add(h.symbol)
  if (h.lines.length !== 6) warnings.push(`${h.name}: ${h.lines.length} lines`)
  for (const l of h.lines) {
    if (!l.text || !l.xiang) warnings.push(`${h.name} ${l.name}: empty text`)
    const yangName = l.name.includes('九')
    if (yangName !== !l.yin) warnings.push(`${h.name} ${l.name}: name/bit mismatch`)
  }
  if (h.tuan && h.tuan.length < 8) warnings.push(`${h.name}: short 彖`)
  if (h.daXiang && h.daXiang.length < 6) warnings.push(`${h.name}: short 大象`)
}

const TRAD_RE = /[亂來係內則實師彙復歸艱萬豶貞財輔遺鄰長陰陽際順顒願馮]/
for (const h of hexagrams) {
  const blob = JSON.stringify(h)
  const m = blob.match(TRAD_RE)
  if (m) warnings.push(`${h.name}: residual traditional char ${m[0]}`)
}

// 折中 audit: every 爻辞 compared after the same conversion, with variant pairs folded.
const cy = read('vendor/wuying.json')
const t2s = read('t2s.json')
const toSimple = (s) => String(s || '')
  .replace(/乾/g, '\u0000')
  .replace(/[\u3400-\u9fff]/g, (c) => t2s[c] || c)
  .replace(/\u0000/g, '乾')
const fold = (s) => {
  const simple = toSimple(conv(String(s || '')))
  return simple
    .replace(/[㧑撝]/g, '撝').replace(/[𦈡繻]/g, '繻').replace(/[𬙊纆]/g, '纆').replace(/[𫗧餗]/g, '餗')
    // documented orthographic variants (see docs/SOURCES.md)
    .replace(/彚/g, '汇').replace(/闚/g, '窥').replace(/朶/g, '朵').replace(/薰/g, '熏')
    .replace(/[，。；：？！、,.;:!?\s]/g, '')
}
const audit = []
for (const h of hexagrams) {
  const w = cy.hexagrams[h.number - 1]
  for (let k = 0; k < 6; k++) {
    const mine = fold(h.lines[k].text)
    const theirs = fold(w.lines[k]).replace(new RegExp(`^${h.lines[k].name}`), '')
    if (mine !== theirs) audit.push({ number: h.number, name: h.name, pos: k + 1, mine, zhezhong: theirs })
  }
  if (h.special && w.special) {
    const mine = fold(h.special.text)
    const theirs = fold(w.special.text).replace(/^用[九六]/, '')
    if (mine !== theirs) audit.push({ number: h.number, name: h.name, pos: '用', mine, zhezhong: theirs })
  }
}

const out = {
  meta: {
    title: '周易经传',
    edition: '王弼本（通行本）经文，参校《御纂周易折中》武英殿刊本爻辞',
    text: '仅古文原文：卦辞、彖传、大象、爻辞、小象、用九用六、乾坤文言。无白话翻译。',
    generatedAt: '2026-11-17',
    sources: [
      'Classical-Chinese-Text-Dataset (wangxb96) yijing_V2.1.json — 基础简体标点本',
      '御纂周易折中 1715 武英殿刊本 爻辞转录 (Zenodo 23298982) — 爻辞校勘',
      'open-iching (john-walks-slow) ichuan — 彖/象/文言对照',
    ],
  },
  trigrams: Object.fromEntries(Object.entries(TRIGRAMS).map(([k, v]) => [v[0], { nature: v[1], symbol: v[2], bits: k.split('').map(Number) }])),
  hexagrams,
}

fs.writeFileSync(path.join(here, '../lib/hexagrams.json'), JSON.stringify(out, null, 2) + '\n')
fs.writeFileSync(path.join(here, 'out-audit.json'), JSON.stringify({ warnings, audit }, null, 2) + '\n')

console.log(`built 64 hexagrams -> lib/hexagrams.json (${(fs.statSync(path.join(here, '../lib/hexagrams.json')).size / 1024).toFixed(1)} KiB)`)
console.log(`overrides applied: ${applied.size}/${OVERRIDES.length}`)
console.log(`warnings: ${warnings.length}`)
warnings.slice(0, 10).forEach((w) => console.log('  !', w))
console.log(`折中 audit remaining diffs: ${audit.length}`)
for (const a of audit) console.log(`  ${a.number}.${a.name} L${a.pos}\n    mine:     ${a.mine}\n    zhezhong: ${a.zhezhong}`)
