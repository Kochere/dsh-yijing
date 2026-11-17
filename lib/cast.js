/**
 * 金钱起卦法（三枚铜钱，六掷）。
 *
 * 约定：背为阳记三，字为阴记二。三背为老阳（九），三字为老阴（六），
 * 一背二字为少阳（七），二背一字为少阴（八）。每爻独立同分布：
 * 六 1/8、七 3/8、八 3/8、九 1/8。
 */
import { randomInt } from 'node:crypto'
import { hexagramOf } from './dataset.js'

export const COIN = { 0: { face: '字', value: 2 }, 1: { face: '背', value: 3 } }

export const LINE_KIND = {
  6: { name: '老阴', yin: true, moving: true, mark: '×' },
  7: { name: '少阳', yin: false, moving: false, mark: '' },
  8: { name: '少阴', yin: true, moving: false, mark: '' },
  9: { name: '老阳', yin: false, moving: true, mark: '○' },
}

const defaultRng = () => randomInt(0, 2)

/** One line: three independent coins. */
export function castLine(rng = defaultRng) {
  const coins = [rng(), rng(), rng()].map((bit) => (bit ? COIN[1] : COIN[0]))
  const value = coins.reduce((sum, c) => sum + c.value, 0)
  const kind = LINE_KIND[value]
  return {
    coins: coins.map((c) => c.face),
    value,
    kind: kind.name,
    yin: kind.yin,
    moving: kind.moving,
    mark: kind.mark,
  }
}

/** Six lines, bottom (初爻) to top (上爻). */
export function castSix(rng = defaultRng) {
  const lines = []
  for (let i = 0; i < 6; i++) lines.push({ pos: i + 1, ...castLine(rng) })
  return lines
}

/** Rebuild a cast from six explicit values 6..9 (tests, CLI replay). */
export function fromValues(values) {
  if (!Array.isArray(values) || values.length !== 6) throw new Error('need six line values (6–9)')
  return values.map((raw, i) => {
    const value = Number(raw)
    const kind = LINE_KIND[value]
    if (!kind) throw new Error(`line ${i + 1}: value ${raw} is not 6, 7, 8 or 9`)
    return {
      pos: i + 1,
      coins: [],
      value,
      kind: kind.name,
      yin: kind.yin,
      moving: kind.moving,
      mark: kind.mark,
    }
  })
}

const LINE_NAMES = (bits) => bits.map((b, i) => {
  const mid = ['初', '二', '三', '四', '五', '上'][i]
  const yy = b ? '九' : '六'
  return i === 0 ? `初${yy}` : i === 5 ? `上${yy}` : `${yy}${mid}`
})

/** 本卦、变卦、动爻。动爻为老阳（九）与老阴（六）。 */
export function derive(lines) {
  const benBits = lines.map((l) => (l.yin ? 0 : 1))
  const moving = lines.filter((l) => l.moving).map((l) => l.pos)
  const bianBits = lines.map((l, i) => (l.moving ? (benBits[i] ? 0 : 1) : benBits[i]))
  const ben = hexagramOf(benBits)
  const bian = hexagramOf(bianBits)
  const names = LINE_NAMES(benBits)
  return {
    ben,
    bian,
    moving,
    changed: moving.length > 0,
    benBits,
    bianBits,
    lines: lines.map((l, i) => ({ ...l, name: names[i] })),
  }
}
