/**
 * 易占 · 金钱卦 — Host plugin.
 *
 * Two model-facing tools:
 *   yijing_cast       六掷金钱：本卦、之卦、动爻，并按朱子变占法取出卦爻辞
 *   yijing_hexagram   查一卦的经传原文（卦辞、彖、大象、爻辞、小象、文言）
 *
 * 只输出《周易》古文原文，不输出白话翻译；解卦由模型自己完成。
 */
import { defineTool, ToolArgsError } from '@deepseek-ai/dsh-tools'
import { castReading, renderReading, summarize } from './lib/reading.js'
import { findHexagram, hexagramLabel } from './lib/dataset.js'
import { formatHexagram } from './lib/format.js'

export const name = 'yijing'
export const inject = ['tools']

const READING_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: { type: 'string', required: true },
    question: { type: 'string' },
    ben: {
      type: 'object',
      additionalProperties: false,
      properties: {
        number: { type: 'integer' },
        name: { type: 'string' },
        fullName: { type: 'string' },
        symbol: { type: 'string' },
        guaCi: { type: 'string' },
      },
    },
    bian: {
      type: 'object',
      additionalProperties: false,
      properties: {
        number: { type: 'integer' },
        name: { type: 'string' },
        fullName: { type: 'string' },
        symbol: { type: 'string' },
        guaCi: { type: 'string' },
      },
    },
    moving: { type: 'array', items: { type: 'integer' } },
    rule: { type: 'string' },
    ruleId: { type: 'integer' },
    lines: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          pos: { type: 'integer' },
          name: { type: 'string' },
          value: { type: 'integer' },
          yin: { type: 'boolean' },
          moving: { type: 'boolean' },
          coins: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    ruling: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          role: { type: 'string' },
          label: { type: 'string' },
          kind: { type: 'string' },
          text: { type: 'string' },
        },
      },
    },
  },
}

const HEXAGRAM_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: { type: 'string', required: true },
    number: { type: 'integer' },
    name: { type: 'string' },
    fullName: { type: 'string' },
    symbol: { type: 'string' },
  },
}

export function apply(ctx, config = {}) {
  const settings = {
    prompt: config.prompt !== false,
    maxQuestion: Number.isFinite(config.maxQuestion) && config.maxQuestion > 0 ? config.maxQuestion : 300,
  }
  registerCast(ctx, settings)
  registerHexagram(ctx, settings)
  if (settings.prompt) addPrompt(ctx)
}

function addPrompt(ctx) {
  try {
    ctx.get('systemPrompt')?.section({
      name: 'yijing',
      order: 880,
      text: [
        'You have a Zhouyi oracle (the yijing tools).',
        'When the user asks a divination question (卜卦、起卦、占问、问卦、看看这事吉凶), make sure you have their concrete question first; if they only gave a topic, ask one short clarifying question. Then call yijing_cast with the question verbatim. Never invent hexagrams, moving lines or 卦爻辞 yourself.',
        'The tool performs the three-coin cast and returns only classical text (卦辞、彖、大象、爻辞、小象) plus the ruling texts chosen by Zhu Xi’s 变占 rule. It never returns a vernacular translation.',
        'If the tool result begins with a ```yijing fenced block, begin your reply with that block verbatim, then write the reading below it. The client renders it as the cast card at the top of the answer; do not omit it, move it after the reading, or edit its lines.',
        'Interpret as a 解卦: state 本卦、之卦、动爻 and the ruling text, read the 卦象 (上下卦、爻位、时义、互错综), and answer the user’s question directly in their language.',
        'The user does not necessarily read 文言. Quote the exact 古文 you rely on, then immediately explain it in plain modern Chinese (白话) — the user must be able to follow the reading without classical Chinese. Never answer with 文言 alone, and keep the two layers visibly separate.',
        'Do not present a modern commentary as if it were 经文; your plain-language explanation is your own reading of the quoted text, not a cited translation.',
        'A divination is a reading of the text, not a prediction of fact: say what the 卦 says about the situation and what it advises, and keep the counsel proportionate.',
      ].join(' '),
    })
  } catch { /* the prompt service is optional */ }
}

function cleanQuestion(raw, max) {
  const text = typeof raw === 'string' ? raw.trim() : ''
  if (!text) throw new ToolArgsError(['question must be a non-empty string: pass the user’s own question'])
  if (text.length > max) throw new ToolArgsError([`question is ${text.length} characters; keep it under ${max} and pass the core question`])
  return text
}

function registerCast(ctx, settings) {
  ctx.tools.register(defineTool({
    name: 'yijing_cast',
    description: 'Cast a 金钱卦 (six casts of three coins) for the user’s question: six casts from bottom to top, giving 本卦, 之卦(变卦), 动爻, and the 卦爻辞 that Zhu Xi’s 《易学启蒙·考变占》 selects for that number of moving lines. '
      + 'Returns only the classical Zhouyi text (卦辞、彖、大象、爻辞、小象), never a vernacular translation. '
      + 'Call it only after you have the user’s concrete question, and pass that question verbatim. '
      + 'Then interpret the returned text yourself and answer the question.',
    parameters: {
      question: {
        type: 'string',
        required: true,
        description: 'The user’s question, verbatim (up to 300 characters). Ask the user for it first if they only gave a topic.',
      },
    },
    output: {
      schema: READING_SCHEMA,
      render: (_args, value) => [{ type: 'text', text: value.text }],
      presentationMeta: (_args, value) => ({
        v: 1,
        question: value.question,
        ben: value.ben?.number,
        bian: value.bian?.number,
        benName: value.ben?.fullName,
        benSymbol: value.ben?.symbol,
        bianName: value.bian?.fullName,
        bianSymbol: value.bian?.symbol,
        moving: value.moving,
        ruleId: value.ruleId,
        lines: value.lines,
      }),
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const question = cleanQuestion(args.question, settings.maxQuestion)
      const reading = castReading(question)
      return { text: renderReading(reading), ...summarize(reading) }
    },
    presentCall(args) {
      const q = String(args.question ?? '').trim()
      return { card: 'generic', title: `起卦：${q.length > 40 ? `${q.slice(0, 40)}…` : q}` }
    },
    presentResult(_args, result) {
      const meta = result && result.meta && typeof result.meta === 'object' ? result.meta : {}
      const moving = Array.isArray(meta.moving) ? meta.moving.length : 0
      const ben = meta.benName || (meta.ben ? `第${meta.ben}卦` : '卦')
      const bian = meta.bianName || (meta.bian ? `第${meta.bian}卦` : '')
      const title = moving && bian
        ? `易占：${ben} ${meta.benSymbol || ''} → ${bian} ${meta.bianSymbol || ''}`
        : `易占：${ben} ${meta.benSymbol || ''}（六爻皆静）`
      return { card: 'generic', title }
    },
  }))
}

function registerHexagram(ctx) {
  ctx.tools.register(defineTool({
    name: 'yijing_hexagram',
    description: 'Look up one of the 64 hexagrams by number, name, full name, symbol, or six-bit code (bottom to top, 1 = 阳, 0 = 阴), and return its classical text: 卦辞、彖、大象、六爻爻辞, with 小象 and 文言 when detail is "full". '
      + 'Use it to study the 之卦, 互卦, 错卦 or 综卦 named by yijing_cast, or any hexagram the user asks about. Returns classical text only.',
    parameters: {
      query: {
        type: 'string',
        required: true,
        description: 'Hexagram number (1–64), name (乾), full name (乾为天), symbol (䷀), or six-bit code (111111).',
      },
      detail: {
        type: 'string',
        enum: ['brief', 'full'],
        description: 'brief (default) = 卦辞、彖、大象 and 六爻爻辞; full adds 小象、用九用六 and 乾坤文言.',
      },
    },
    output: {
      schema: HEXAGRAM_SCHEMA,
      render: (_args, value) => [{ type: 'text', text: value.text }],
      presentationMeta: (_args, value) => ({ number: value.number }),
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const query = typeof args.query === 'string' ? args.query.trim() : ''
      if (!query) throw new ToolArgsError(['query must be a non-empty string: a number, name, symbol or six-bit code'])
      const h = findHexagram(query)
      if (!h) throw new ToolArgsError([`no hexagram matches ${JSON.stringify(query)}; use a number 1–64, a name such as 乾 or 乾为天, or a six-bit code`])
      const detail = args.detail === 'full' ? 'full' : 'brief'
      return {
        text: formatHexagram(h, { detail }),
        number: h.number,
        name: h.name,
        fullName: h.fullName,
        symbol: h.symbol,
      }
    },
    presentCall(args) {
      return { card: 'generic', title: `查卦：${String(args.query ?? '').trim()}` }
    },
  }))
}
