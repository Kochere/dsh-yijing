import test from 'node:test'
import assert from 'node:assert/strict'
import { HEXAGRAMS, findHexagram, hexagramOf, nuclearBits, oppositeBits, inverseBits, BY_NUMBER } from '../lib/dataset.js'

test('64 hexagrams, numbered 1..64 in King Wen order', () => {
  assert.equal(HEXAGRAMS.length, 64)
  HEXAGRAMS.forEach((h, i) => {
    assert.equal(h.number, i + 1)
    assert.ok(h.name && h.fullName && h.symbol)
    assert.equal(h.symbol, String.fromCodePoint(0x4dc0 + i))
  })
  assert.deepEqual(HEXAGRAMS.map((h) => h.name).slice(0, 8), ['乾', '坤', '屯', '蒙', '需', '讼', '师', '比'])
  assert.equal(HEXAGRAMS[63].name, '未济')
})

test('six lines each, names match yin/yang bits', () => {
  let lines = 0
  for (const h of HEXAGRAMS) {
    assert.equal(h.lines.length, 6, h.name)
    h.lines.forEach((line, i) => {
      lines++
      const yang = !line.yin
      const nameIsYang = line.name.includes('九')
      assert.equal(nameIsYang, yang, `${h.name} ${line.name}`)
      assert.ok(line.text.length > 1, `${h.name} ${line.name} text`)
      assert.ok(line.xiang.length > 1, `${h.name} ${line.name} xiang`)
      assert.equal(h.bits[i], yang ? 1 : 0)
    })
  }
  assert.equal(lines, 384)
})

test('every hexagram has 卦辞, 彖 and 大象; only 乾/坤 carry 用九用六 and 文言', () => {
  for (const h of HEXAGRAMS) {
    assert.ok(h.guaCi.trim().length >= 2, h.name)
    assert.ok(h.tuan.trim().length >= 8, h.name)
    assert.ok(h.daXiang.trim().length >= 6, h.name)
    if (h.number === 1) {
      assert.equal(h.special.name, '用九')
      assert.equal(h.special.text, '见群龙无首，吉。')
      assert.ok(h.wenyan.length > 500)
    } else if (h.number === 2) {
      assert.equal(h.special.name, '用六')
      assert.equal(h.special.text, '利永贞。')
      assert.ok(h.wenyan.length > 300)
    } else {
      assert.equal(h.special, undefined, h.name)
      assert.equal(h.wenyan, undefined, h.name)
    }
  }
})

test('known hexagrams and binary codes (bottom to top)', () => {
  assert.equal(hexagramOf([1, 1, 1, 1, 1, 1]).number, 1)
  assert.equal(hexagramOf([0, 0, 0, 0, 0, 0]).number, 2)
  assert.equal(hexagramOf([1, 0, 0, 0, 1, 0]).number, 3) // 屯 水雷
  assert.equal(hexagramOf([0, 1, 0, 0, 0, 1]).number, 4) // 蒙 山水
  assert.equal(hexagramOf([1, 0, 1, 0, 1, 0]).number, 63) // 既济 水火
  assert.equal(hexagramOf([0, 1, 0, 1, 0, 1]).number, 64) // 未济 火水
  assert.equal(hexagramOf([0, 1, 1, 1, 1, 1]).number, 44) // 姤 天风
})

test('relations: 互卦, 错卦, 综卦', () => {
  const qian = BY_NUMBER.get(1)
  assert.equal(hexagramOf(nuclearBits(qian.bits)).number, 1)
  assert.equal(hexagramOf(oppositeBits(qian.bits)).number, 2)
  assert.equal(hexagramOf(inverseBits(qian.bits)).number, 1)
  const zhun = BY_NUMBER.get(3)
  assert.deepEqual(nuclearBits(zhun.bits), [0, 0, 0, 0, 0, 1])
  assert.equal(hexagramOf(nuclearBits(zhun.bits)).number, 23) // 屯之互卦为剥
})

test('lookup by number, name, full name, symbol, bits and aliases', () => {
  assert.equal(findHexagram('1').name, '乾')
  assert.equal(findHexagram('第64卦').name, '未济')
  assert.equal(findHexagram('乾').number, 1)
  assert.equal(findHexagram('乾卦').number, 1)
  assert.equal(findHexagram('乾为天').number, 1)
  assert.equal(findHexagram('䷀').number, 1)
  assert.equal(findHexagram('111111').number, 1)
  assert.equal(findHexagram('1 1 1 1 1 1').number, 1)
  assert.equal(findHexagram('习坎').number, 29)
  assert.equal(findHexagram('遁').number, 33)
  assert.equal(findHexagram('不存在'), undefined)
})
