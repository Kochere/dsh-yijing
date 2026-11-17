/** 文本排印：只排古文原文，不生成白话翻译。 */
import { hexagramOf, nuclearBits, oppositeBits, inverseBits, hexagramLabel } from './dataset.js'

const VALUE_CN = { 6: '六', 7: '七', 8: '八', 9: '九' }
const BAR_YANG = '▅▅▅'
const BAR_YIN = '▅　▅'

export function lineBars(line) {
  const bars = line.yin ? BAR_YIN : BAR_YANG
  return line.moving ? `${bars}${line.mark}` : bars
}

export function formatLineRow(line) {
  const coins = line.coins?.length ? line.coins.join('·') : ''
  const state = line.moving ? '动' : '静'
  const cn = VALUE_CN[line.value]
  return [
    line.name,
    `${line.kind}（${cn}）`,
    lineBars(line),
    coins,
    state,
  ].filter(Boolean).join('　')
}

export function formatRelations(h) {
  const nuclear = hexagramOf(nuclearBits(h.bits))
  const opposite = hexagramOf(oppositeBits(h.bits))
  const inverse = hexagramOf(inverseBits(h.bits))
  return `互卦：${hexagramLabel(nuclear)}｜错卦：${hexagramLabel(opposite)}｜综卦：${hexagramLabel(inverse)}`
}

function guaBlock(h, { tuan = true, daxiang = true } = {}) {
  const out = [hexagramLabel(h), `卦辞：${h.guaCi}`]
  if (tuan && h.tuan) out.push(`彖曰：${h.tuan}`)
  if (daxiang && h.daXiang) out.push(`象曰：${h.daXiang}`)
  return out
}

/**
 * @param {object} reading { question, lines, ben, bian, moving, ruling }
 */
export function formatReading({ question, lines, ben, bian, moving, ruling }) {
  const out = []
  const q = question.trim().replace(/\s*\n\s*/g, ' ')
  out.push('```yijing')
  out.push(`问：${q}`)
  out.push(`本：${ben.fullName}`)
  out.push(`之：${moving.length ? bian.fullName : ''}`)
  out.push(`爻：${lines.map((l) => `${l.name}|${VALUE_CN[l.value]}|${(l.coins || []).join('')}`).join('；')}`)
  out.push(`法：${ruling.name}：${ruling.short}`)
  out.push('```', '')

  out.push('【所问】', q, '')

  out.push('【起卦】金钱卦 · 六掷（三枚铜钱；单枚背三、字二；自初爻至上爻）')
  for (const line of lines) out.push(formatLineRow(line))
  out.push('')

  out.push('【本卦】', ...guaBlock(ben), '')

  if (moving.length) {
    const names = moving.map((p) => ben.lines[p - 1].name)
    out.push(`【动爻】${names.join('、')}（${moving.length}爻动）`, '')
  } else {
    out.push('【动爻】无（六爻皆静）', '')
  }

  if (moving.length) {
    out.push('【变卦】', ...guaBlock(bian, { tuan: false }), '')
  } else {
    out.push('【变卦】无（六爻皆静，无之卦）', '')
  }

  out.push(`【占断】${ruling.name}：${ruling.short}`)
  out.push(`朱子《易学启蒙·考变占》：“${ruling.basis}”`)
  if (ruling.note) out.push(`（${ruling.note}）`)
  out.push('')
  for (const pick of ruling.selections) {
    out.push(`${pick.role}　${pick.label}`)
    out.push(`　　${pick.text}`)
    if (pick.xiang) out.push(`　　象曰：${pick.xiang}`)
    if (pick.tuan) out.push(`　　彖曰：${pick.tuan}`)
    out.push('')
  }

  const extras = []
  if (ruling.selections.every((s) => s.kind !== '卦辞') && moving.length) {
    extras.push(`之卦卦辞：${bian.guaCi}`)
  }
  if (ruling.selections.every((s) => s.source !== 'ben') && moving.length === 0) {
    // unreachable, kept for clarity
  }
  extras.push(formatRelations(ben))
  out.push('【旁参】', ...extras, '')
  out.push('（所引皆《周易》古文原文，无今译。）')
  return out.join('\n')
}

/** One hexagram, full classical text. */
export function formatHexagram(h, { detail = 'brief' } = {}) {
  const out = [hexagramLabel(h), `卦辞：${h.guaCi}`]
  if (h.tuan) out.push(`彖曰：${h.tuan}`)
  if (h.daXiang) out.push(`象曰：${h.daXiang}`)
  out.push('')
  for (const line of h.lines) {
    out.push(`${line.name}　${line.text}`)
    if (detail === 'full' && line.xiang) out.push(`　　象曰：${line.xiang}`)
  }
  if (h.special) {
    out.push(`${h.special.name}　${h.special.text}`)
    if (detail === 'full' && h.special.xiang) out.push(`　　象曰：${h.special.xiang}`)
  }
  if (detail === 'full' && h.wenyan) {
    out.push('', '【文言传】', h.wenyan)
  }
  out.push('', '【旁参】', formatRelations(h), '', '（所引皆《周易》古文原文，无今译。）')
  return out.join('\n')
}
