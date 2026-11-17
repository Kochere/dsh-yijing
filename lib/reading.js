/** 起卦 → 本卦/之卦/动爻 → 取辞 → 排印，一条链路。 */
import { castSix, fromValues, derive } from './cast.js'
import { selectTexts } from './rules.js'
import { formatReading } from './format.js'

export function readingFromLines(question, lines) {
  const derived = derive(lines)
  const ruling = selectTexts(derived.ben, derived.bian, derived.moving)
  return {
    question,
    lines: derived.lines,
    ben: derived.ben,
    bian: derived.bian,
    moving: derived.moving,
    changed: derived.changed,
    ruling,
  }
}

export function castReading(question, rng) {
  return readingFromLines(question, castSix(rng))
}

export function replayReading(question, values) {
  return readingFromLines(question, fromValues(values))
}

export function renderReading(reading) {
  return formatReading(reading)
}

export function summarize(reading) {
  return {
    question: reading.question,
    ben: {
      number: reading.ben.number,
      name: reading.ben.name,
      fullName: reading.ben.fullName,
      symbol: reading.ben.symbol,
      guaCi: reading.ben.guaCi,
    },
    bian: {
      number: reading.bian.number,
      name: reading.bian.name,
      fullName: reading.bian.fullName,
      symbol: reading.bian.symbol,
      guaCi: reading.bian.guaCi,
    },
    moving: reading.moving,
    rule: `${reading.ruling.name}：${reading.ruling.short}`,
    ruleId: reading.ruling.rule,
    lines: reading.lines.map((l) => ({
      pos: l.pos,
      name: l.name,
      value: l.value,
      yin: l.yin,
      moving: l.moving,
      coins: l.coins,
    })),
    ruling: reading.ruling.selections.map((s) => ({
      role: s.role,
      label: s.label,
      kind: s.kind,
      text: s.text,
    })),
  }
}
