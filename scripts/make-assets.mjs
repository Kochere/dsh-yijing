#!/usr/bin/env node
/**
 * Generates the static GitHub-facing artwork: local badges and the README banner.
 * Run: node scripts/make-assets.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const badgesDir = path.join(root, 'docs', 'badges')
fs.mkdirSync(badgesDir, { recursive: true })

const BADGES = [
  ['dsh', 'DSH', 'plugin', '#6E40C9'],
  ['license', 'license', 'MIT', '#2F7D4F'],
  ['tests', 'tests', '27 passing', '#2F7D4F'],
  ['deps', 'dependencies', '0', '#2F7D4F'],
  ['node', 'node', '>= 20', '#339933'],
  ['network', 'network', 'none', '#8250DF'],
]

function badge(label, value, color) {
  const font = 11
  const pad = 7
  const char = 6.2
  const wLabel = Math.ceil(label.length * char + pad * 2)
  const wValue = Math.ceil(value.length * char + pad * 2)
  const w = wLabel + wValue
  const labelMid = wLabel / 2
  const valueMid = wLabel + wValue / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${label}: ${value}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${w}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${wLabel}" height="20" fill="#555"/>
    <rect x="${wLabel}" width="${wValue}" height="20" fill="${color}"/>
    <rect width="${w}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="${font}">
    <text x="${labelMid}" y="14">${label}</text>
    <text x="${valueMid}" y="14">${value}</text>
  </g>
</svg>
`
}

for (const [file, left, right, color] of BADGES) {
  fs.writeFileSync(path.join(badgesDir, `${file}.svg`), badge(left, right, color))
}

const BANNER = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="300" viewBox="0 0 1280 300" role="img" aria-label="dsh-yijing — I Ching coin oracle for DeepSeek Harness">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FBF7EC"/>
      <stop offset="1" stop-color="#F3EBD9"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#A8402C"/>
      <stop offset="1" stop-color="#C9A227"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="300" fill="url(#paper)"/>
  <g opacity=".06" stroke="#A8402C" stroke-width="1">
    ${Array.from({ length: 25 }, (_, i) => `<line x1="${i * 52}" y1="0" x2="${i * 52}" y2="300"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${i * 52}" x2="1280" y2="${i * 52}"/>`).join('')}
  </g>
  <rect x="0" y="0" width="9" height="300" fill="url(#edge)"/>
  <g transform="translate(58,52)">
    <rect width="58" height="58" rx="13" fill="#A8402C"/>
    <text x="29" y="41" text-anchor="middle" font-family="Songti SC, Noto Serif SC, serif" font-size="31" fill="#fff">易</text>
  </g>
  <text x="137" y="88" font-family="Georgia, 'Times New Roman', 'Songti SC', serif" font-size="48" font-weight="700" fill="#211D19">dsh-yijing</text>
  <text x="139" y="127" font-family="-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif" font-size="21" fill="#6F665C">I Ching coin oracle for DeepSeek Harness</text>
  <text x="139" y="171" font-family="-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif" font-size="15" fill="#8A7F70">Zhu Xi’s change rule · 64 hexagrams · 384 lines · classical text only</text>
  <text x="139" y="199" font-family="-apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif" font-size="15" fill="#8A7F70">Local randomness · zero dependencies · no network</text>
  <g transform="translate(846,48)" fill="#A8402C">
    <rect x="0" y="0" width="150" height="15" rx="3"/>
    <rect x="0" y="27" width="61" height="15" rx="3"/><rect x="89" y="27" width="61" height="15" rx="3"/>
    <rect x="0" y="54" width="150" height="15" rx="3"/>
    <rect x="0" y="81" width="61" height="15" rx="3"/><rect x="89" y="81" width="61" height="15" rx="3"/>
    <rect x="0" y="108" width="150" height="15" rx="3"/>
    <rect x="0" y="135" width="61" height="15" rx="3"/><rect x="89" y="135" width="61" height="15" rx="3"/>
  </g>
  <g transform="translate(1046,48)">
    <g fill="none" stroke="#8A6B12" stroke-width="1.4">
      <circle cx="26" cy="26" r="23" fill="#D9B44A"/>
      <circle cx="26" cy="26" r="18.5" stroke-opacity=".45"/>
      <rect x="19" y="19" width="14" height="14" rx="2" fill="#FBF7EC"/>
      <circle cx="95" cy="26" r="23" fill="#D9B44A"/>
      <circle cx="95" cy="26" r="18.5" stroke-opacity=".45"/>
      <rect x="88" y="19" width="14" height="14" rx="2" fill="#FBF7EC"/>
      <circle cx="164" cy="26" r="23" fill="#D9B44A"/>
      <circle cx="164" cy="26" r="18.5" stroke-opacity=".45"/>
      <rect x="157" y="19" width="14" height="14" rx="2" fill="#FBF7EC"/>
    </g>
    <text x="95" y="82" text-anchor="middle" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="13" fill="#8A7F70">单枚背三字二</text>
    <text x="95" y="112" text-anchor="middle" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="13" fill="#8A7F70">六掷成卦</text>
  </g>
</svg>
`
fs.writeFileSync(path.join(root, 'docs', 'banner.svg'), BANNER)
console.log('wrote docs/banner.svg and', BADGES.length, 'badges')
