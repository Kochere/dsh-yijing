/**
 * 易占 · 金钱卦 — Client half.
 *
 * Registers a `yijing` Markdown-fence layer and a turn-tail fallback, so a
 * divination is part of the main transcript (not hidden in a collapsed tool row):
 * three coins flip, six lines draw bottom-to-top, then 本卦 → 之卦 settle.
 *
 * The card reads the cast from the tool result text (the same text the model
 * receives); `block.meta` is used as a fallback. No Host round-trip, no extra
 * files: the 64-hexagram table is embedded below.
 */

window.__ModuleLoader__.load({
  id: '@local/dsh-yijing',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useMemo, useEffect, useRef } = React

    /* ---------------------------------------------------------- 64 卦表 */
    const HEX = [
      [1, '乾', '乾为天', '䷀', '111111'],
      [2, '坤', '坤为地', '䷁', '000000'],
      [3, '屯', '水雷屯', '䷂', '100010'],
      [4, '蒙', '山水蒙', '䷃', '010001'],
      [5, '需', '水天需', '䷄', '111010'],
      [6, '讼', '天水讼', '䷅', '010111'],
      [7, '师', '地水师', '䷆', '010000'],
      [8, '比', '水地比', '䷇', '000010'],
      [9, '小畜', '风天小畜', '䷈', '111011'],
      [10, '履', '天泽履', '䷉', '110111'],
      [11, '泰', '地天泰', '䷊', '111000'],
      [12, '否', '天地否', '䷋', '000111'],
      [13, '同人', '天火同人', '䷌', '101111'],
      [14, '大有', '火天大有', '䷍', '111101'],
      [15, '谦', '地山谦', '䷎', '001000'],
      [16, '豫', '雷地豫', '䷏', '000100'],
      [17, '随', '泽雷随', '䷐', '100110'],
      [18, '蛊', '山风蛊', '䷑', '011001'],
      [19, '临', '地泽临', '䷒', '110000'],
      [20, '观', '风地观', '䷓', '000011'],
      [21, '噬嗑', '火雷噬嗑', '䷔', '100101'],
      [22, '贲', '山火贲', '䷕', '101001'],
      [23, '剥', '山地剥', '䷖', '000001'],
      [24, '复', '地雷复', '䷗', '100000'],
      [25, '无妄', '天雷无妄', '䷘', '100111'],
      [26, '大畜', '山天大畜', '䷙', '111001'],
      [27, '颐', '山雷颐', '䷚', '100001'],
      [28, '大过', '泽风大过', '䷛', '011110'],
      [29, '坎', '坎为水', '䷜', '010010'],
      [30, '离', '离为火', '䷝', '101101'],
      [31, '咸', '泽山咸', '䷞', '001110'],
      [32, '恒', '雷风恒', '䷟', '011100'],
      [33, '遯', '天山遯', '䷠', '001111'],
      [34, '大壮', '雷天大壮', '䷡', '111100'],
      [35, '晋', '火地晋', '䷢', '000101'],
      [36, '明夷', '地火明夷', '䷣', '101000'],
      [37, '家人', '风火家人', '䷤', '101011'],
      [38, '睽', '火泽睽', '䷥', '110101'],
      [39, '蹇', '水山蹇', '䷦', '001010'],
      [40, '解', '雷水解', '䷧', '010100'],
      [41, '损', '山泽损', '䷨', '110001'],
      [42, '益', '风雷益', '䷩', '100011'],
      [43, '夬', '泽天夬', '䷪', '111110'],
      [44, '姤', '天风姤', '䷫', '011111'],
      [45, '萃', '泽地萃', '䷬', '000110'],
      [46, '升', '地风升', '䷭', '011000'],
      [47, '困', '泽水困', '䷮', '010110'],
      [48, '井', '水风井', '䷯', '011010'],
      [49, '革', '泽火革', '䷰', '101110'],
      [50, '鼎', '火风鼎', '䷱', '011101'],
      [51, '震', '震为雷', '䷲', '100100'],
      [52, '艮', '艮为山', '䷳', '001001'],
      [53, '渐', '风山渐', '䷴', '001011'],
      [54, '归妹', '雷泽归妹', '䷵', '110100'],
      [55, '丰', '雷火丰', '䷶', '101100'],
      [56, '旅', '火山旅', '䷷', '001101'],
      [57, '巽', '巽为风', '䷸', '011011'],
      [58, '兑', '兑为泽', '䷹', '110110'],
      [59, '涣', '风水涣', '䷺', '010011'],
      [60, '节', '水泽节', '䷻', '110010'],
      [61, '中孚', '风泽中孚', '䷼', '110011'],
      [62, '小过', '雷山小过', '䷽', '001100'],
      [63, '既济', '水火既济', '䷾', '101010'],
      [64, '未济', '火水未济', '䷿', '010101'],
    ]
    const BY_NUMBER = new Map(HEX.map((g) => [g[0], g]))
    const BY_BITS = new Map(HEX.map((g) => [g[4], g]))

    const LINE_NAMES = ['初', '二', '三', '四', '五', '上']
    const VALUE_CN = { 6: '六', 7: '七', 8: '八', 9: '九' }
    const VALUE_KIND = { 6: '老阴', 7: '少阳', 8: '少阴', 9: '老阳' }

    function nameOf(yang, pos) {
      const yy = yang ? '九' : '六'
      return pos === 1 ? `初${yy}` : pos === 6 ? `上${yy}` : `${yy}${LINE_NAMES[pos - 1]}`
    }

    /* ------------------------------------------------------------ 读取 */

    function blockText(block) {
      const content = block && block.content
      if (!Array.isArray(content)) return ''
      return content
        .filter((c) => c && c.type === 'text' && typeof c.text === 'string')
        .map((c) => c.text)
        .join('\n')
    }

    function readQuestion(props) {
      const block = props.block || {}
      try {
        const q = block.args && typeof block.args.text === 'function' ? block.args.text('question') : undefined
        if (q && String(q).trim()) return String(q).trim()
      } catch { /* partial args */ }
      try {
        const raw = props.phase === 'start' ? block.argsRaw : block.call && block.call.argsRaw
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed.question === 'string' && parsed.question.trim()) return parsed.question.trim()
        }
      } catch { /* not JSON yet */ }
      return ''
    }

    function parseLines(text) {
      const out = []
      for (const raw of text.split('\n')) {
        const line = raw.trim()
        const m = line.match(/^(初[九六]|[九六][二三四五]|上[九六])\u3000([^\u3000]+)\u3000/)
        if (!m) continue
        const parts = line.split('\u3000')
        const state = parts[parts.length - 1]
        let coinAt = -1
        if (/^[字背·]+$/.test(parts[parts.length - 2] || '')) coinAt = parts.length - 2
        const kindPart = parts[1] || ''
        const cn = (kindPart.match(/（([六七八九])）/) || [])[1]
        const value = cn ? { 六: 6, 七: 7, 八: 8, 九: 9 }[cn] : undefined
        const coins = coinAt > 0 ? parts[coinAt].split(/[·,，]/).filter(Boolean) : []
        out.push({ name: m[1], value, kind: kindPart.replace(/（.*$/, ''), coins, moving: state === '动' })
      }
      return out
    }

    function parseReading(text) {
      if (!text) return null
      const qm = text.match(/【所问】\n([\s\S]*?)\n\n【起卦】/)
      const ben = text.match(/【本卦】\n第(\d+)卦\u3000([^\u3000]+)\u3000([\u4dc0-\u4dff])/)
      const bian = text.match(/【变卦】\n第(\d+)卦\u3000([^\u3000]+)\u3000([\u4dc0-\u4dff])/)
      const rule = text.match(/【占断】([^\n]+)/)
      const lines = parseLines(text)
      return {
        question: qm ? qm[1].trim() : '',
        ben: ben ? { number: Number(ben[1]), name: ben[2], symbol: ben[3] } : null,
        bian: bian ? { number: Number(bian[1]), name: bian[2], symbol: bian[3] } : null,
        rule: rule ? rule[1].trim() : '',
        lines,
      }
    }

    const CN_VALUE = { 六: 6, 七: 7, 八: 8, 九: 9 }

    function findHexByName(name) {
      const query = String(name || '').trim()
      if (!query) return null
      return HEX.find((h) => h[2] === query || h[1] === query) || null
    }

    /** Parse the fenced cast block the tool returns under a ```yijing fence. */
    function parseFenceCode(code) {
      const fields = new Map()
      for (const raw of String(code || '').split('\n')) {
        const match = raw.trim().match(/^([^：:]{1,8})[：:]\s*(.*)$/)
        if (match) fields.set(match[1].trim(), match[2].trim())
      }
      const ben = findHexByName(fields.get('本'))
      if (!ben) return null
      const rows = (fields.get('爻') || '').split(/[；;]/).map((row) => row.trim()).filter(Boolean)
      if (rows.length !== 6) return null
      const lines = []
      for (let i = 0; i < rows.length; i++) {
        const parts = rows[i].split(/[|｜,，]/).map((part) => part.trim())
        const value = CN_VALUE[parts[1]]
        if (!parts[0] || !value) return null
        const coins = [...(parts[2] || '')].filter((face) => face === '背' || face === '字')
        lines.push({
          pos: i + 1,
          name: parts[0],
          value,
          coins,
          yin: value === 6 || value === 8,
          moving: value === 6 || value === 9,
        })
      }
      const moving = lines.filter((line) => line.moving).map((line) => line.pos)
      let bian = ben[0]
      if (moving.length) {
        const bits = ben[4].split('').map((bit, i) => (moving.includes(i + 1) ? (bit === '1' ? '0' : '1') : bit)).join('')
        const found = BY_BITS.get(bits)
        if (found) bian = found[0]
      }
      return {
        question: fields.get('问') || '',
        ben: ben[0],
        bian,
        moving,
        rule: fields.get('法') || '',
        lines,
      }
    }

    function fenceBlock(fence) {
      return {
        kind: 'tool-result',
        name: 'yijing_cast',
        callId: 'fence',
        content: [],
        meta: {
          v: 1,
          question: fence.question,
          ben: fence.ben,
          bian: fence.bian,
          moving: fence.moving,
          rule: fence.rule,
          lines: fence.lines,
        },
        args: { text: (key) => (key === 'question' ? fence.question : undefined) },
        call: { name: 'yijing_cast', argsRaw: JSON.stringify({ question: fence.question }) },
        subCalls: [],
      }
    }

    /** HOC layer for ```yijing fences in the assistant's answer. */
    function YijingFenceLayer(props) {
      const parsed = useMemo(() => parseFenceCode(props.code), [props.code])
      if (!parsed) {
        // While the answer streams, the fence may be half-written. Hide the
        // partial code rather than flashing it; fall back to it only if the
        // finished block is still not a valid cast.
        return props.streaming ? null : (props.children || null)
      }
      return h(YijingCastView, { phase: 'result', toolName: 'yijing_cast', callId: 'fence', block: fenceBlock(parsed) })
    }

    function coinFaces(value) {
      if (value === 9) return ['背', '背', '背']
      if (value === 6) return ['字', '字', '字']
      if (value === 7) return ['背', '字', '字']
      if (value === 8) return ['背', '背', '字']
      return []
    }

    function buildReading(props) {
      const question = readQuestion(props)
      if (props.phase !== 'result') return { question, pending: true, lines: [], moving: [], ben: null, bian: null }
      const text = blockText(props.block)
      const parsed = parseReading(text)
      const meta = (props.block && props.block.meta) || {}
      const benNumber = (parsed && parsed.ben && parsed.ben.number) || (Number.isFinite(meta.ben) ? meta.ben : 0)
      const ben = BY_NUMBER.get(benNumber)
      if (!ben) return { question, pending: false, invalid: true, lines: [], moving: [], ben: null, bian: null }

      const bits = ben[4]
      const parsedLines = (parsed && parsed.lines) || []
      const metaLines = Array.isArray(meta.lines) ? meta.lines : []
      const movingPos = []
      if (parsed && parsed.lines.length === 6) {
        parsed.lines.forEach((l, i) => { if (l.moving) movingPos.push(i + 1) })
      } else if (Array.isArray(meta.moving)) {
        for (const p of meta.moving) if (Number.isFinite(p)) movingPos.push(Number(p))
      }
      const moving = [...new Set(movingPos)].sort((a, b) => a - b)

      const bianBits = bits.split('').map((b, i) => (moving.includes(i + 1) ? (b === '1' ? '0' : '1') : b)).join('')
      const bian = moving.length ? BY_BITS.get(bianBits) || null : null

      const lines = [1, 2, 3, 4, 5, 6].map((pos) => {
        const yang = bits[pos - 1] === '1'
        const isMoving = moving.includes(pos)
        const value = isMoving ? (yang ? 9 : 6) : (yang ? 7 : 8)
        const got = parsed && parsed.lines ? parsed.lines[pos - 1] : undefined
        const metaLine = metaLines[pos - 1]
        const metaCoins = metaLine && Array.isArray(metaLine.coins) && metaLine.coins.length ? metaLine.coins : null
        const coins = metaCoins || (got && got.coins && got.coins.length ? got.coins : coinFaces(value))
        return {
          pos,
          yang,
          moving: isMoving,
          value,
          name: (metaLine && metaLine.name) || (got && got.name) || nameOf(yang, pos),
          kind: VALUE_KIND[value],
          coins,
        }
      })

      return {
        question: question || (parsed && parsed.question) || '',
        pending: false,
        invalid: false,
        lines,
        moving,
        ben,
        bian,
        rule: (parsed && parsed.rule) || meta.rule || '',
      }
    }

    /* ------------------------------------------------------------ 图标 */

    function Coin(props) {
      return h('span', { className: `yj-coin${props.spin ? ' yj-coin-spin' : ''}`, style: { '--yj-i': props.index || 0 } },
        h('svg', { viewBox: '0 0 40 40', width: props.size || 30, height: props.size || 30, 'aria-hidden': 'true' },
          h('circle', { cx: 20, cy: 20, r: 17.5, fill: 'var(--yj-gold)', stroke: 'var(--yj-gold-deep)', strokeWidth: 1.2 }),
          h('circle', { cx: 20, cy: 20, r: 14.2, fill: 'none', stroke: 'var(--yj-gold-deep)', strokeWidth: 0.7, opacity: 0.55 }),
          h('rect', { x: 14.4, y: 14.4, width: 11.2, height: 11.2, rx: 1.4, fill: 'var(--dsw-alias-bg-layer-1)', stroke: 'var(--yj-gold-deep)', strokeWidth: 1 }),
          h('circle', { cx: 20, cy: 6.4, r: 0.9, fill: 'var(--yj-gold-deep)', opacity: 0.7 }),
          h('circle', { cx: 20, cy: 33.6, r: 0.9, fill: 'var(--yj-gold-deep)', opacity: 0.7 }),
          h('circle', { cx: 6.4, cy: 20, r: 0.9, fill: 'var(--yj-gold-deep)', opacity: 0.7 }),
          h('circle', { cx: 33.6, cy: 20, r: 0.9, fill: 'var(--yj-gold-deep)', opacity: 0.7 }),
        ),
      )
    }

    function Pips(props) {
      if (!props.coins || !props.coins.length) return null
      return h('span', { className: 'yj-pips', title: props.coins.join('·') },
        props.coins.map((face, i) =>
          h('i', { key: i, className: face === '背' ? 'yj-pip yj-back' : 'yj-pip yj-face' }),
        ),
      )
    }

    function LineRow(props) {
      const line = props.line
      const delay = `${1.0 + (line.pos - 1) * 0.22}s`
      return h('div', {
        className: `yj-line${line.moving ? ' yj-moving' : ''}`,
        style: { '--yj-d': delay },
      },
        h('span', { className: 'yj-line-name' }, line.name),
        h('span', { className: `yj-bar ${line.yang ? 'yj-yang' : 'yj-yin'}` },
          h('i'), line.yang ? null : h('i'),
        ),
        h('span', { className: 'yj-line-value' }, VALUE_CN[line.value]),
        h(Pips, { coins: line.coins }),
        h('span', { className: 'yj-line-mark' }, line.moving ? '动' : ''),
      )
    }

    function GUA(props) {
      const gua = props.gua
      if (!gua) return null
      return h('div', { className: `yj-gua${props.muted ? ' yj-gua-muted' : ''}` },
        h('span', { className: 'yj-sym' }, gua[3]),
        h('span', { className: 'yj-gua-text' },
          h('b', { className: 'yj-gua-name' }, gua[2]),
          h('small', { className: 'yj-gua-tag' }, props.tag),
        ),
      )
    }

    /* ------------------------------------------------------------ 卡片 */

    function YijingCastView(props) {
      const [run, setRun] = useState(0)
      const [zoom, setZoom] = useState(1)
      const cardRef = useRef(null)
      const scaleRef = useRef(null)
      const data = useMemo(() => {
        try {
          return buildReading(props)
        } catch (error) {
          if (typeof console !== 'undefined') console.error('[yijing] cast card failed', error)
          return {
            pending: false,
            invalid: true,
            error: String((error && error.message) || error),
            question: readQuestion(props),
            lines: [],
            moving: [],
            ben: null,
            bian: null,
          }
        }
      }, [props.block, props.phase])

      // The cast animation plays once on mount. If the card is mounted below the
      // fold (or inside a collapsed step), it is already over by the time the user
      // scrolls to it. Replay it once when it first becomes visible.
      useEffect(() => {
        const node = cardRef.current
        if (!node || props.phase !== 'result') return undefined
        if (typeof IntersectionObserver !== 'function') return undefined
        const rect = node.getBoundingClientRect()
        const onScreen = rect.top < (window.innerHeight || 0) && rect.bottom > 0
        if (onScreen) return undefined
        let fired = false
        const io = new IntersectionObserver((entries) => {
          if (fired || !entries.some((entry) => entry.isIntersecting)) return
          fired = true
          io.disconnect()
          setRun((n) => n + 1)
        }, { threshold: 0.3 })
        io.observe(node)
        return () => io.disconnect()
      }, [props.phase])

      // Keep one tight design (640px). Wider transcript columns scale the whole
      // card proportionally instead of stretching the left/right gap; narrower
      // columns use the compact layout at 1×.
      useEffect(() => {
        const node = scaleRef.current
        if (!node || typeof ResizeObserver !== 'function') return undefined
        const update = () => {
          const width = node.clientWidth
          const next = width > 640 ? Math.min(1.3, width / 640) : 1
          setZoom((prev) => (Math.abs(prev - next) < 0.01 ? prev : next))
        }
        update()
        const ro = new ResizeObserver(update)
        ro.observe(node)
        return () => ro.disconnect()
      }, [])

      const frame = (card) => h('div', { className: 'yj-scale', ref: scaleRef },
        h('div', { className: 'yj-scale-inner', style: { zoom } }, card),
      )

      if (data.pending) {
        return frame(h('div', { className: 'yj-card yj-card-pending', 'data-yj': 'pending' },
          h(Style, null),
          h('div', { className: 'yj-head' },
            h('span', { className: 'yj-seal' }, '易'),
            h('span', { className: 'yj-headtext' },
              h('span', { className: 'yj-kicker' }, '金钱卦 · 六掷'),
              h('span', { className: 'yj-q' }, data.question || '取问中…'),
            ),
            h('span', { className: 'yj-status' }, h('i', { className: 'yj-live' }), '起卦中'),
          ),
          h('div', { className: 'yj-pending-stage' },
            h('div', { className: 'yj-coins yj-coins-big' },
              [0, 1, 2].map((i) => h(Coin, { key: i, index: i, spin: true, size: 34 })),
            ),
            h('div', { className: 'yj-pending-bars' }, [0, 1, 2, 3, 4, 5].map((i) => h('i', { key: i }))),
            h('div', { className: 'yj-pending-text' }, '三枚铜钱，自初爻至上爻'),
          ),
        ))
      }

      if (data.invalid) {
        return frame(h('div', { className: 'yj-card', 'data-yj': 'invalid' },
          h(Style, null),
          h('div', { className: 'yj-head' },
            h('span', { className: 'yj-seal' }, '易'),
            h('span', { className: 'yj-headtext' },
              h('span', { className: 'yj-kicker' }, '金钱卦 · 六掷'),
              h('span', { className: 'yj-q' }, data.question || '所问之事'),
            ),
          ),
          h('div', { className: 'yj-pending-text' }, '此卦未能读出，请重起一卦。'),
          data.error ? h('div', { className: 'yj-error' }, data.error) : null,
        ))
      }

      const ben = data.ben
      const bian = data.bian

      return frame(h('div', { ref: cardRef, className: 'yj-card', 'data-yj': 'result', 'data-run': run },
        h(Style, null),
        h('div', { className: 'yj-head' },
          h('span', { className: 'yj-seal' }, '易'),
          h('span', { className: 'yj-headtext' },
            h('span', { className: 'yj-kicker' }, '金钱卦 · 六掷'),
            h('span', { className: 'yj-q', title: data.question }, data.question || '所问之事'),
          ),
          h('span', { className: 'yj-coins yj-coins-head' },
            [0, 1, 2].map((i) => h(Coin, { key: i, index: i, spin: true, size: 22 })),
          ),
        ),

        h('div', { className: 'yj-body', key: `body-${run}` },
          h('div', { className: 'yj-lines' },
            [6, 5, 4, 3, 2, 1].map((pos) => h(LineRow, { key: `${run}-${pos}`, line: data.lines[pos - 1] })),
          ),
          h('div', { className: 'yj-outcome' },
            h('div', { className: 'yj-gua-wrap' },
              h(GUA, { gua: ben, tag: '本卦' }),
              bian ? h(GUA, { gua: bian, tag: '之卦' }) : null,
            ),
            data.rule ? h('div', { className: 'yj-rule' }, data.rule.replace(/^[^：]+：/, '')) : null,
          ),
        ),

        h('div', { className: 'yj-foot' },
          h('span', { className: 'yj-foot-hint' }, '三枚铜钱 · 六掷成卦'),
          h('button', {
            type: 'button',
            className: 'yj-replay',
            title: '只重播本卦动画，不重新起卦',
            onClick: () => setRun((n) => n + 1),
          }, '重演'),
        ),
      ))
    }

    /* ------------------------------------------------------------ 样式 */

    function Style() {
      return h('style', null, CSS)
    }

    const CSS = `
.yj-scale { width: 100%; }
.yj-scale-inner { width: 100%; }
.yj-card {
  --yj-ink: var(--dsw-alias-label-primary);
  --yj-muted: var(--dsw-alias-label-secondary);
  --yj-line: var(--dsw-alias-border-l1);
  --yj-cinnabar: color-mix(in oklab, #A8402C 86%, var(--dsw-alias-label-primary));
  --yj-gold: color-mix(in oklab, #C9A227 74%, var(--dsw-alias-bg-layer-1));
  --yj-gold-deep: color-mix(in oklab, #7A5F12 70%, var(--dsw-alias-label-primary));
  position: relative;
  width: min(100%, 640px);
  box-sizing: border-box;
  container-type: inline-size;
  container-name: yjcard;
  margin: 14px 0 6px;
  padding: 14px 18px 12px;
  border: 1px solid color-mix(in oklab, var(--yj-line) 74%, #A8402C);
  border-radius: 14px;
  background:
    radial-gradient(120% 90% at 0% 0%, color-mix(in oklab, #A8402C 7%, transparent) 0%, transparent 62%),
    var(--dsw-alias-bg-layer-1);
  color: var(--yj-ink);
  font-size: 13px;
  line-height: 1.45;
  overflow: hidden;
  animation: yj-card-in .32s ease both;
}
.yj-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, #A8402C, #C9A227);
  opacity: .9;
}
.yj-head { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
.yj-seal {
  flex: none;
  width: 32px; height: 32px;
  border-radius: 8px;
  background: #A8402C;
  color: #fff;
  display: grid; place-items: center;
  font: 600 17px/1 "Songti SC", "Noto Serif SC", serif;
  letter-spacing: 0;
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.22);
}
.yj-headtext { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.yj-kicker { font-size: 10.5px; letter-spacing: .12em; color: var(--yj-muted); }
.yj-q {
  font-size: 13.5px; font-weight: 550; line-height: 1.35;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.yj-status { flex: none; display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--yj-muted); padding-top: 3px; }
.yj-live { width: 6px; height: 6px; border-radius: 50%; background: #A8402C; animation: yj-pulse 1s ease-in-out infinite; }

.yj-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 22px;
  margin-top: 13px;
}
.yj-lines { flex: 0 0 auto; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.yj-coins { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; opacity: .95; }
.yj-coins-head { margin: 0 0 0 auto; gap: 4px; opacity: 1; }
.yj-coin { display: inline-block; transform-style: preserve-3d; }
.yj-coin-spin { animation: yj-flip .9s cubic-bezier(.35,.1,.3,1) both; animation-delay: calc(var(--yj-i) * .09s); }

.yj-line {
  display: grid;
  grid-template-columns: 34px minmax(0, 150px) 12px 24px 14px;
  gap: 8px;
  align-items: center;
  min-width: 0;
  opacity: 0;
  animation: yj-line-in .34s ease both;
  animation-delay: var(--yj-d);
}
.yj-line-name { min-width: 0; font-size: 11.5px; color: var(--yj-muted); font-variant-numeric: tabular-nums; }
.yj-bar { display: inline-flex; gap: 5px; height: 9px; width: 100%; max-width: 150px; min-width: 0; }
.yj-bar i {
  display: block; flex: 1; height: 100%; border-radius: 1.5px;
  background: var(--yj-cinnabar);
  transform: scaleX(0); transform-origin: left center;
  animation: yj-bar-in .42s cubic-bezier(.25,.8,.3,1) both;
  animation-delay: calc(var(--yj-d) + .12s);
}
.yj-line-value { font-size: 11px; color: var(--yj-muted); text-align: center; }
.yj-pips { display: inline-flex; gap: 3px; width: 24px; }
.yj-pip { width: 5px; height: 5px; border-radius: 50%; display: block; }
.yj-pip.yj-back { background: var(--yj-gold); box-shadow: inset 0 0 0 1px var(--yj-gold-deep); }
.yj-pip.yj-face { box-shadow: inset 0 0 0 1px var(--yj-gold-deep); opacity: .55; }
.yj-line-mark { font-size: 10px; color: var(--yj-cinnabar); text-align: right; }
.yj-moving .yj-bar i { box-shadow: 0 0 0 1px color-mix(in oklab, var(--yj-cinnabar) 55%, transparent); }
.yj-moving .yj-line-name { color: var(--yj-cinnabar); font-weight: 600; }

.yj-outcome {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}
.yj-gua-wrap { display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px 18px; }
.yj-gua { display: flex; align-items: center; gap: 10px; opacity: 0; animation: yj-fade-in .45s ease both; animation-delay: 2.45s; }
.yj-gua-muted { opacity: .9; }
.yj-sym {
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  border: 1px solid color-mix(in oklab, #A8402C 22%, transparent);
  background: color-mix(in oklab, #A8402C 8%, transparent);
  color: var(--yj-cinnabar);
  font-family: "Songti SC", "Noto Serif SC", serif;
  font-size: 48px;
  line-height: 1;
}
.yj-gua-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.yj-gua-name { font-size: 17px; font-weight: 600; white-space: nowrap; }
.yj-gua-tag { font-size: 10px; letter-spacing: .14em; color: var(--yj-muted); }
.yj-rule {
  font-size: 11px; color: var(--yj-muted); line-height: 1.4; text-align: center;
  opacity: 0; animation: yj-fade-in .4s ease both; animation-delay: 2.8s;
}
.yj-foot {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 10px;
  margin-top: 10px; padding-top: 8px;
  border-top: 1px dashed color-mix(in oklab, var(--yj-line) 78%, transparent);
}
.yj-foot-hint { font-size: 10px; letter-spacing: .08em; color: var(--yj-muted); }
.yj-replay {
  appearance: none; border: 1px solid color-mix(in oklab, var(--yj-line) 70%, #A8402C);
  background: transparent; color: var(--yj-cinnabar);
  border-radius: 999px; padding: 3px 12px; font-size: 11px; cursor: pointer;
  font-family: inherit;
}
.yj-replay:hover { background: color-mix(in oklab, #A8402C 9%, transparent); }

.yj-error { margin-top: 8px; font-size: 11px; color: var(--dsw-alias-state-error-primary); word-break: break-word; }
.yj-card-pending .yj-pending-stage { margin-top: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 4px 0 8px; }
.yj-coins-big { gap: 14px; margin: 0; }
.yj-pending-bars { display: flex; flex-direction: column; gap: 5px; width: 148px; }
.yj-pending-bars i {
  display: block; height: 7px; border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--yj-cinnabar), transparent);
  opacity: .18; animation: yj-shimmer 1.4s ease-in-out infinite;
}
.yj-pending-bars i:nth-child(2) { animation-delay: .08s; }
.yj-pending-bars i:nth-child(3) { animation-delay: .16s; }
.yj-pending-bars i:nth-child(4) { animation-delay: .24s; }
.yj-pending-bars i:nth-child(5) { animation-delay: .32s; }
.yj-pending-bars i:nth-child(6) { animation-delay: .4s; }
.yj-pending-text { font-size: 11px; color: var(--yj-muted); letter-spacing: .06em; }

@keyframes yj-card-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes yj-flip {
  0% { transform: rotateY(0deg) translateY(0); }
  45% { transform: rotateY(300deg) translateY(-3px); }
  100% { transform: rotateY(720deg) translateY(0); }
}
@keyframes yj-line-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
@keyframes yj-bar-in { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes yj-fade-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
@keyframes yj-pulse { 0%, 100% { opacity: .35; transform: scale(.85); } 50% { opacity: 1; transform: scale(1); } }
@keyframes yj-shimmer { 0%, 100% { opacity: .12; } 50% { opacity: .32; } }

@container yjcard (max-width: 585px) {
  .yj-body { display: block; }
  .yj-outcome {
    margin: 12px 0 0;
    padding-top: 10px;
    border-top: 1px dashed color-mix(in oklab, var(--yj-line) 78%, transparent);
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .yj-gua-wrap { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px 16px; }
  .yj-sym { width: 56px; height: 56px; font-size: 42px; }
  .yj-gua-name { font-size: 16px; }
}
@container yjcard (max-width: 420px) {
  .yj-head { flex-wrap: wrap; }
  .yj-status { margin-left: auto; }
  .yj-gua-wrap { flex-direction: row; align-items: center; gap: 8px 14px; }
  .yj-sym { width: 54px; height: 54px; font-size: 40px; }
  .yj-gua-name { font-size: 15px; }
  .yj-line { grid-template-columns: 30px minmax(0, 1fr) 12px 24px 14px; gap: 6px; }
  .yj-line-name { font-size: 10.5px; }
  .yj-bar { max-width: none; }
  .yj-foot-hint { font-size: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .yj-card, .yj-card *, .yj-card *::before { animation-duration: .001s !important; animation-delay: 0s !important; }
}
`

    return {
      inject: ['slots'],
      apply(ctx) {
        return ctx.slots.inject('conversation.chat.markdown.fence', () => ctx.slots.register(
          { name: 'conversation.chat.markdown.fence', key: 'yijing', id: 'yijing-cast-fence', order: 10 },
          YijingFenceLayer,
        ))
      },
      // Test seam: not part of the loader contract, used by test/client.test.mjs.
      __yijing: { card: YijingCastView, fence: YijingFenceLayer },
    }
  },
})
