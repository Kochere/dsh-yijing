#!/usr/bin/env node
/**
 * Downloads the transcriptions used to build lib/hexagrams.json.
 * The raw files are not committed; run this before scripts/build-data.mjs.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const vendor = path.join(here, 'vendor')
fs.mkdirSync(vendor, { recursive: true })

const SOURCES = [
  ['wangxb.json', 'https://raw.githubusercontent.com/wangxb96/Classical-Chinese-Text-Dataset/main/data/yijing_V2.1.json'],
  ['wuying.json', 'https://zenodo.org/api/records/23298982/files/wuying-lines.json/content'],
  ['open-iching.json', 'https://raw.githubusercontent.com/john-walks-slow/open-iching/main/iching/iching.json'],
  ['tuan.json', 'https://raw.githubusercontent.com/john-walks-slow/open-iching/main/ichuan/tuan.json'],
  ['xiang.json', 'https://raw.githubusercontent.com/john-walks-slow/open-iching/main/ichuan/xiang.json'],
  ['wen.json', 'https://raw.githubusercontent.com/john-walks-slow/open-iching/main/ichuan/wen.json'],
]

let failed = 0
for (const [name, url] of SOURCES) {
  const file = path.join(vendor, name)
  process.stdout.write(`· ${name} … `)
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    JSON.parse(text)
    fs.writeFileSync(file, text)
    console.log(`${(text.length / 1024).toFixed(1)} KiB`)
  } catch (error) {
    failed++
    console.log(`FAILED: ${error.message}`)
    console.log(`  ${url}`)
  }
}

if (failed) {
  console.error(`\n${failed} source(s) failed. Check the URLs and your network, then rerun.`)
  process.exit(1)
}
console.log('\nAll sources downloaded. Next: node scripts/build-data.mjs')
