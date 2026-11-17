import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { replayReading, renderReading } from '../lib/reading.js'

const clientPath = fileURLToPath(new URL('../client.js', import.meta.url))
const source = fs.readFileSync(clientPath, 'utf8')

const React = {
  Fragment: Symbol('Fragment'),
  createElement(type, props, ...children) {
    return { type, props: { ...(props || {}), children: children.flat(Infinity).filter((c) => c != null && c !== false && c !== true) } }
  },
  useState(init) { return [typeof init === 'function' ? init() : init, () => {}] },
  useMemo(fn) { return fn() },
  useRef(init) { return { current: init } },
  useEffect() {},
}

function loadClient() {
  let definition
  const sandbox = { window: { __ModuleLoader__: { load(def) { definition = def } } }, console }
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox)
  assert.ok(definition, 'client factory registered')
  return definition
}

function collectText(node, out = []) {
  if (node == null || node === false || node === true) return out
  if (Array.isArray(node)) { for (const n of node) collectText(n, out); return out }
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out }
  if (node.type === React.Fragment) { collectText(node.props.children, out); return out }
  if (typeof node.type === 'function') { collectText(node.type(node.props), out); return out }
  collectText(node.props.children, out)
  return out
}

function collectVisible(node, out = []) {
  if (node == null || node === false || node === true) return out
  if (Array.isArray(node)) { for (const n of node) collectVisible(n, out); return out }
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out }
  if (node.type === 'style') return out
  if (node.type === React.Fragment) { collectVisible(node.props.children, out); return out }
  if (typeof node.type === 'function') { collectVisible(node.type(node.props), out); return out }
  collectVisible(node.props.children, out)
  return out
}

const question = '这个方案能否顺利落地？'
const reading = replayReading(question, [6, 8, 9, 7, 7, 6])
const text = renderReading(reading)

function resultProps() {
  return {
    phase: 'result',
    toolName: 'yijing_cast',
    callId: 'test',
    block: {
      content: [{ type: 'text', text }],
      meta: undefined,
      args: { text: (key) => (key === 'question' ? question : undefined) },
      call: { name: 'yijing_cast', argsRaw: JSON.stringify({ question }) },
      subCalls: [],
    },
  }
}

function loadMod() {
  const definition = loadClient()
  const mod = definition.factory((name) => {
    if (name === 'react') return React
    throw new Error(`unexpected require ${name}`)
  })
  return { definition, mod, card: mod.__yijing.card }
}

test('client registers the yijing fence layer', () => {
  const { definition, mod } = loadMod()
  assert.equal(definition.id, '@local/dsh-yijing')
  const registered = []
  const injected = []
  const ctx = {
    slots: {
      inject(slot, callback) {
        injected.push(slot)
        return callback()
      },
      register(options, component) {
        registered.push({ options, component })
        return () => {}
      },
    },
  }
  mod.apply(ctx)
  assert.deepEqual(injected, ['conversation.chat.markdown.fence'])
  const fence = registered.find((r) => r.options.name === 'conversation.chat.markdown.fence')
  assert.ok(fence)
  assert.equal(fence.options.key, 'yijing')
  assert.equal(fence.options.id, 'yijing-cast-fence')
  assert.equal(typeof fence.component, 'function')
})

test('result view renders question, six lines, 本卦 and 之卦 from the tool text', () => {
  const { card: Comp } = loadMod()
  const tree = Comp(resultProps())
  const textOut = collectText(tree).join('|')
  for (const expect of [question, '泽山咸', '天雷无妄', '初六', '九三', '上六', '本卦', '之卦', '动', '占本卦及之卦卦辞']) {
    assert.ok(textOut.includes(expect), `missing ${expect}`)
  }
  assert.ok(textOut.includes('重演'))
  assert.ok(!textOut.includes('undefined'))
  assert.ok(!textOut.includes('NaN'))
})

test('the cast card shows no Arabic digits', () => {
  const { card: Comp } = loadMod()
  const textOut = collectVisible(Comp(resultProps())).join('|')
  assert.ok(!/[0-9]/.test(textOut), textOut)
})

test('the yijing fence renders the card before the reading', () => {
  const { mod } = loadMod()
  const code = [
    '问：这个方案可行吗？',
    '本：坤为地',
    '之：水山蹇',
    '爻：初六|八|背背字；六二|八|字背背；六三|六|字字字；六四|八|背背字；六五|六|字字字；上六|八|字背背',
    '法：二爻变：占本卦两变爻爻辞，以上爻为主',
  ].join('\n')
  const tree = mod.__yijing.fence({ code, lang: 'yijing', streaming: false })
  const textOut = collectVisible(tree).join('|')
  for (const expect of ['这个方案可行吗', '坤为地', '水山蹇', '初六', '上六', '重演']) assert.ok(textOut.includes(expect), `missing ${expect}`)
  assert.ok(!/[0-9]/.test(textOut), textOut)
})

test('a malformed yijing fence falls back to the raw code block', () => {
  const { mod } = loadMod()
  const children = React.createElement('pre', null, 'raw-fence')
  const tree = mod.__yijing.fence({ code: 'not a cast', lang: 'yijing', streaming: false, children })
  assert.equal(collectVisible(tree).join(''), 'raw-fence')
})

test('meta fallback works when the result text is absent', () => {
  const { card: Comp } = loadMod()
  const props = resultProps()
  props.block.content = []
  props.block.meta = { ben: 31, bian: 25, moving: [1, 3, 6] }
  const textOut = collectText(Comp(props)).join('|')
  assert.ok(textOut.includes('泽山咸'))
  assert.ok(textOut.includes('天雷无妄'))
  assert.ok(textOut.includes('初六'))
})

test('malformed result renders a visible error instead of throwing', () => {
  const { card: Comp } = loadMod()
  const props = resultProps()
  props.block = { content: [], meta: { ben: 'not-a-number' }, args: { text: () => question }, call: null, subCalls: [] }
  const textOut = collectText(Comp(props)).join('|')
  assert.ok(textOut.includes('未能读出'))
})

test('pending view shows the casting state and the question', () => {
  const { card: Comp } = loadMod()
  const props = {
    phase: 'start',
    toolName: 'yijing_cast',
    callId: 'test',
    block: { name: 'yijing_cast', argsRaw: JSON.stringify({ question }), args: { text: () => question }, subCalls: [] },
  }
  const textOut = collectText(Comp(props)).join('|')
  for (const expect of [question, '起卦中', '三枚铜钱']) assert.ok(textOut.includes(expect), `missing ${expect}`)
})
