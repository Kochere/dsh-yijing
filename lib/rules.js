/**
 * 朱子《易学启蒙·考变占》六爻变占法。
 *
 * 朱子所谓“彖辞”，指卦下之辞，即卦辞，不是《彖传》。
 */
export const RULES = {
  0: {
    id: 0,
    name: '六爻不变',
    short: '占本卦卦辞',
    basis: '凡卦六爻皆不变，则占本卦彖辞，而以内卦为贞，外卦为悔。',
  },
  1: {
    id: 1,
    name: '一爻变',
    short: '占本卦变爻爻辞',
    basis: '一爻变，则以本卦变爻辞占。',
  },
  2: {
    id: 2,
    name: '二爻变',
    short: '占本卦两变爻爻辞，以上爻为主',
    basis: '二爻变，则以本卦二变爻辞占，仍以上爻为主。',
  },
  3: {
    id: 3,
    name: '三爻变',
    short: '占本卦及之卦卦辞，以本卦为贞',
    basis: '三爻变，则占本卦及之卦之彖辞，而以本卦为贞，之卦为悔。',
    note: '朱子又云“前十卦主贞，后十卦主悔”；此处取本卦为主。',
  },
  4: {
    id: 4,
    name: '四爻变',
    short: '占之卦两不变爻爻辞，以下爻为主',
    basis: '四爻变，则以之卦二不变爻占，仍以下爻为主。',
  },
  5: {
    id: 5,
    name: '五爻变',
    short: '占之卦不变爻爻辞',
    basis: '五爻变，则以之卦不变爻占。',
  },
  6: {
    id: 6,
    name: '六爻变',
    short: '乾坤占用九用六，余卦占之卦卦辞',
    basis: '六爻变，则乾坤占二用，余卦占之卦彖辞。',
  },
}

const lineLabel = (h, pos) => `${h.name}${h.lines[pos - 1].name}`

function yao(h, pos, primary, source = 'ben') {
  const line = h.lines[pos - 1]
  return {
    source,
    pos,
    kind: '爻辞',
    label: `${source === 'ben' ? '本卦' : '之卦'}${lineLabel(h, pos)}`,
    text: line.text,
    xiang: line.xiang,
    primary,
    role: primary ? '主' : '次',
  }
}

function gua(h, primary, source = 'ben') {
  return {
    source,
    pos: null,
    kind: '卦辞',
    label: `${source === 'ben' ? '本卦' : '之卦'}卦辞（${h.name}）`,
    text: h.guaCi,
    tuan: h.tuan,
    xiang: h.daXiang,
    primary,
    role: primary ? '主' : '次',
  }
}

/**
 * @param {object} ben   本卦
 * @param {object} bian  之卦（变卦）
 * @param {number[]} moving 动爻位（1..6）
 */
export function selectTexts(ben, bian, moving) {
  const count = moving.length
  const rule = RULES[count]
  const staticPositions = [1, 2, 3, 4, 5, 6].filter((p) => !moving.includes(p))
  let selections

  if (count === 0) {
    selections = [gua(ben, true)]
  } else if (count === 1) {
    selections = [yao(ben, moving[0], true)]
  } else if (count === 2) {
    const [low, high] = [...moving].sort((a, b) => a - b)
    selections = [yao(ben, high, true), yao(ben, low, false)]
  } else if (count === 3) {
    selections = [gua(ben, true), gua(bian, false, 'bian')]
  } else if (count === 4) {
    const [low, high] = staticPositions
    selections = [yao(bian, low, true, 'bian'), yao(bian, high, false, 'bian')]
  } else if (count === 5) {
    selections = [yao(bian, staticPositions[0], true, 'bian')]
  } else if (ben.special) {
    selections = [{
      source: 'special',
      pos: null,
      kind: '用辞',
      label: `本卦${ben.special.name}`,
      text: ben.special.text,
      xiang: ben.special.xiang,
      primary: true,
      role: '主',
    }]
  } else {
    selections = [gua(bian, true, 'bian')]
  }

  return {
    rule: rule.id,
    name: rule.name,
    short: rule.short,
    basis: rule.basis,
    note: rule.note ?? null,
    selections,
  }
}
