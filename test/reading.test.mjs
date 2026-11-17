import test from 'node:test'
import assert from 'node:assert/strict'
import { castLine, castSix, fromValues, derive, LINE_KIND } from '../lib/cast.js'
import { selectTexts } from '../lib/rules.js'
import { castReading, replayReading, renderReading } from '../lib/reading.js'
import { HEXAGRAMS } from '../lib/dataset.js'

function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32 < 0.5 ? 0 : 1
  }
}

function ruleFor(values) {
  const reading = replayReading('test', values)
  return reading
}

test('coin mapping: 背=3 字=2, six/seven/eight/nine', () => {
  assert.equal(LINE_KIND[6].name, '老阴')
  assert.equal(LINE_KIND[7].name, '少阳')
  assert.equal(LINE_KIND[8].name, '少阴')
  assert.equal(LINE_KIND[9].name, '老阳')
  assert.equal(LINE_KIND[6].moving, true)
  assert.equal(LINE_KIND[9].moving, true)
  assert.equal(LINE_KIND[7].moving, false)
  assert.equal(LINE_KIND[8].moving, false)

  const allHeads = castLine(() => 1)
  assert.equal(allHeads.value, 9)
  assert.deepEqual(allHeads.coins, ['背', '背', '背'])
  const allTails = castLine(() => 0)
  assert.equal(allTails.value, 6)
  assert.deepEqual(allTails.coins, ['字', '字', '字'])
  const seq = [1, 0, 0]
  let i = 0
  const mixed = castLine(() => seq[i++])
  assert.equal(mixed.value, 7)
  assert.deepEqual(mixed.coins, ['背', '字', '字'])
})

test('line probabilities are 1/8, 3/8, 3/8, 1/8', () => {
  const rng = seeded(42)
  const counts = { 6: 0, 7: 0, 8: 0, 9: 0 }
  const n = 40000
  for (let i = 0; i < n; i++) counts[castLine(rng).value]++
  const expected = { 6: 0.125, 7: 0.375, 8: 0.375, 9: 0.125 }
  for (const v of [6, 7, 8, 9]) {
    const p = counts[v] / n
    assert.ok(Math.abs(p - expected[v]) < 0.015, `value ${v}: ${p}`)
  }
})

test('fromValues round-trips and rejects illegal values', () => {
  const lines = fromValues([7, 8, 9, 6, 7, 8])
  assert.equal(lines.length, 6)
  assert.equal(lines[2].name, undefined)
  assert.equal(lines[2].kind, '老阳')
  assert.throws(() => fromValues([7, 7, 7, 7, 7]))
  assert.throws(() => fromValues([7, 7, 7, 7, 7, 10]))
})

test('all still lines give 乾, no moving, 之卦 same', () => {
  const r = derive(fromValues([7, 7, 7, 7, 7, 7]))
  assert.equal(r.ben.number, 1)
  assert.equal(r.bian.number, 1)
  assert.deepEqual(r.moving, [])
  assert.equal(r.changed, false)
})

test('all old-yang gives 乾之坤 with six moving lines', () => {
  const r = derive(fromValues([9, 9, 9, 9, 9, 9]))
  assert.equal(r.ben.number, 1)
  assert.equal(r.bian.number, 2)
  assert.deepEqual(r.moving, [1, 2, 3, 4, 5, 6])
})

test('all old-yin gives 坤之乾 with six moving lines', () => {
  const r = derive(fromValues([6, 6, 6, 6, 6, 6]))
  assert.equal(r.ben.number, 2)
  assert.equal(r.bian.number, 1)
  assert.deepEqual(r.moving, [1, 2, 3, 4, 5, 6])
})

test('one moving line in 乾 becomes 姤', () => {
  const r = derive(fromValues([9, 7, 7, 7, 7, 7]))
  assert.equal(r.ben.number, 1)
  assert.equal(r.bian.number, 44)
  assert.deepEqual(r.moving, [1])
})

test('六爻变: 乾占用九, 坤占用六, 余卦占之卦卦辞', () => {
  const qian = ruleFor([9, 9, 9, 9, 9, 9])
  assert.equal(qian.ruling.rule, 6)
  assert.equal(qian.ruling.selections[0].label, '本卦用九')
  assert.equal(qian.ruling.selections[0].text, '见群龙无首，吉。')

  const kun = ruleFor([6, 6, 6, 6, 6, 6])
  assert.equal(kun.ruling.rule, 6)
  assert.equal(kun.ruling.selections[0].label, '本卦用六')
  assert.equal(kun.ruling.selections[0].text, '利永贞。')

  const other = ruleFor([9, 6, 9, 6, 9, 6])
  assert.equal(other.ruling.rule, 6)
  assert.equal(other.ruling.selections[0].kind, '卦辞')
  assert.equal(other.ruling.selections[0].source, 'bian')
})

test('all seven 变占 branches select the right texts', () => {
  // 0 moving — 本卦卦辞
  let r = ruleFor([7, 8, 7, 8, 7, 8])
  assert.equal(r.ruling.rule, 0)
  assert.equal(r.ruling.selections.length, 1)
  assert.equal(r.ruling.selections[0].kind, '卦辞')
  assert.equal(r.ruling.selections[0].source, 'ben')

  // 1 moving — the moving line's 爻辞
  r = ruleFor([7, 9, 7, 8, 7, 8])
  assert.equal(r.ruling.rule, 1)
  assert.equal(r.ruling.selections[0].pos, 2)
  assert.equal(r.ruling.selections[0].label, `本卦${r.ben.name}${r.ben.lines[1].name}`)

  // 2 moving — both, upper is primary
  r = ruleFor([7, 9, 7, 8, 6, 8])
  assert.equal(r.ruling.rule, 2)
  assert.deepEqual(r.ruling.selections.map((s) => s.pos), [5, 2])
  assert.equal(r.ruling.selections[0].role, '主')
  assert.equal(r.ruling.selections[1].role, '次')

  // 3 moving — both 卦辞, 本卦 primary
  r = ruleFor([7, 9, 8, 6, 9, 8])
  assert.equal(r.ruling.rule, 3)
  assert.deepEqual(r.ruling.selections.map((s) => `${s.source}:${s.kind}`), ['ben:卦辞', 'bian:卦辞'])

  // 4 moving — 之卦 two static lines, lower primary
  r = ruleFor([9, 9, 9, 9, 7, 7])
  assert.equal(r.ruling.rule, 4)
  assert.equal(r.moving.length, 4)
  assert.deepEqual(r.ruling.selections.map((s) => s.pos), [5, 6])
  assert.equal(r.ruling.selections[0].source, 'bian')
  assert.equal(r.ruling.selections[0].role, '主')

  // 5 moving — 之卦 single static line
  r = ruleFor([9, 9, 9, 9, 9, 7])
  assert.equal(r.ruling.rule, 5)
  assert.equal(r.ruling.selections.length, 1)
  assert.equal(r.ruling.selections[0].pos, 6)
  assert.equal(r.ruling.selections[0].source, 'bian')
})

test('every possible moving-line count is reachable and every rule is covered', () => {
  const covered = new Set()
  for (let mask = 0; mask < 64; mask++) {
    const values = [0, 1, 2, 3, 4, 5].map((i) => {
      const moving = (mask >> i) & 1
      const yang = i % 2 === 0
      if (moving) return yang ? 9 : 6
      return yang ? 7 : 8
    })
    const r = replayReading('x', values)
    covered.add(r.ruling.rule)
    assert.equal(r.ruling.selections.length >= 1, true)
    assert.ok(r.ben && r.bian)
  }
  assert.deepEqual([...covered].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6])
})

test('render contains the classical sections and no vernacular translation', () => {
  const reading = castReading('问事业', seeded(7))
  const text = renderReading(reading)
  for (const marker of ['【所问】', '【起卦】', '【本卦】', '【占断】', '【旁参】', '卦辞：', '彖曰：', '朱子《易学启蒙·考变占》', '无今译']) {
    assert.ok(text.includes(marker), marker)
  }
  assert.ok(!/译文|白话|现代汉语/.test(text))
  assert.ok(text.length < 6000, `too long: ${text.length}`)
})

test('a fixed replay is stable and deterministic', () => {
  const a = renderReading(replayReading('同问', [7, 8, 9, 6, 7, 8]))
  const b = renderReading(replayReading('同问', [7, 8, 9, 6, 7, 8]))
  assert.equal(a, b)
})

test('full dataset: every hexagram renders in brief and full mode', async () => {
  const { formatHexagram } = await import('../lib/format.js')
  for (const h of HEXAGRAMS) {
    const brief = formatHexagram(h, { detail: 'brief' })
    const full = formatHexagram(h, { detail: 'full' })
    assert.ok(brief.includes(h.guaCi))
    assert.ok(full.length >= brief.length)
    assert.ok(!/译文|白话/.test(full))
  }
})
