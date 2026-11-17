#!/usr/bin/env node
/**
 * 命令行起卦 / 查卦，便于不开 DSH 也能核对工具输出。
 *
 *   yijing cast "这个方案能否落地"
 *   yijing cast --values 7,8,9,6,7,8 "复核此卦"
 *   yijing hexagram 1
 *   yijing hexagram 乾为天 --full
 *   yijing cast "…" --json
 */
import { castReading, replayReading, renderReading, summarize } from '../lib/reading.js'
import { findHexagram } from '../lib/dataset.js'
import { formatHexagram } from '../lib/format.js'

const USAGE = `易占 · 金钱卦

用法：
  yijing cast "所问之事"            六掷金钱，排出本卦、之卦、动爻并取卦爻辞
  yijing cast --values 7,8,9,6,7,8 "所问之事"
                                     以指定六爻复核（自初爻至上爻，取 6/7/8/9）
  yijing hexagram <卦>              查卦：序号、卦名、卦符、六位阴阳皆可
  yijing hexagram <卦> --full       连同小象、用九用六、乾坤文言

选项：
  --json                            输出结构化 JSON
  --full                            查卦时输出全本
  -h, --help                        显示本帮助
`

function parseArgs(argv) {
  const positional = []
  const flags = { json: false, full: false, values: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--json') flags.json = true
    else if (a === '--full') flags.full = true
    else if (a === '--values' || a === '-v') flags.values = argv[++i] ?? ''
    else if (a.startsWith('--values=')) flags.values = a.slice('--values='.length)
    else if (a === '-h' || a === '--help') flags.help = true
    else positional.push(a)
  }
  return { positional, flags }
}

function fail(message) {
  console.error(`yijing: ${message}`)
  console.error('试用 yijing --help')
  process.exit(1)
}

const { positional, flags } = parseArgs(process.argv.slice(2))
const command = positional[0]

if (flags.help || !command) {
  console.log(USAGE)
  process.exit(command ? 0 : 1)
}

if (command === 'cast') {
  const question = positional.slice(1).join(' ').trim()
  if (!question) fail('cast 需要所问之事，例如：yijing cast "此次谈判能否成"')
  let reading
  if (flags.values) {
    const values = flags.values.split(/[,，\s]+/).filter(Boolean)
    if (values.length !== 6) fail('--values 需要六个数字，例如 7,8,9,6,7,8')
    reading = replayReading(question, values)
  } else {
    reading = castReading(question)
  }
  if (flags.json) {
    console.log(JSON.stringify({ ...summarize(reading), text: renderReading(reading) }, null, 2))
  } else {
    console.log(renderReading(reading))
  }
  process.exit(0)
}

if (command === 'hexagram' || command === 'gua') {
  const query = positional.slice(1).join(' ').trim()
  if (!query) fail('hexagram 需要卦名、序号或六位阴阳，例如：yijing hexagram 乾')
  const h = findHexagram(query)
  if (!h) fail(`找不到「${query}」；可用序号 1–64、卦名（乾）、卦名全称（乾为天）或六位阴阳（111111）`)
  if (flags.json) console.log(JSON.stringify(h, null, 2))
  else console.log(formatHexagram(h, { detail: flags.full ? 'full' : 'brief' }))
  process.exit(0)
}

fail(`未知命令「${command}」`)
