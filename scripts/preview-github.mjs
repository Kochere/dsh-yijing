#!/usr/bin/env node
/**
 * Builds a local, GitHub-like repository page for review.
 *
 * It is a design mock, not GitHub: counts are illustrative, the header says so,
 * and no GitHub asset is copied. README.md is rendered with `marked`.
 *
 * Dev-only: `npm i marked` (or run from a folder with it) before using.
 * Run: node scripts/preview-github.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const outDir = path.join(root, 'preview')
fs.mkdirSync(outDir, { recursive: true })

let marked
try {
  ({ marked } = await import('marked'))
} catch {
  console.error('This preview generator needs marked: npm i marked')
  process.exit(1)
}

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8')
const readmeHtml = marked.parse(readme, { gfm: true, breaks: false })

const FILES = [
  ['.github', 'dir', 'CI and issue templates', '3 hours ago'],
  ['bin', 'dir', 'CLI for replay and lookup', '3 hours ago'],
  ['docs', 'dir', 'provenance, example reading, artwork', '12 minutes ago'],
  ['lib', 'dir', 'bundled Zhouyi text and cast logic', '1 hour ago'],
  ['locale', 'dir', 'plugin title and description', '2 days ago'],
  ['scripts', 'dir', 'data build and preview generators', '12 minutes ago'],
  ['test', 'dir', '27 tests', '1 hour ago'],
  ['.gitignore', 'file', 'Ignore builds and vendored sources', '2 days ago'],
  ['CHANGELOG.md', 'file', 'v1.0.0', '12 minutes ago'],
  ['CONTRIBUTING.md', 'file', 'How to run the suite and rebuild the text', '1 hour ago'],
  ['LICENSE', 'file', 'MIT', '2 days ago'],
  ['README.md', 'file', 'The cast, the text, the card', '12 minutes ago'],
  ['README.zh-CN.md', 'file', '中文说明', '12 minutes ago'],
  ['SECURITY.md', 'file', 'Runtime makes no network calls', '1 hour ago'],
  ['cordis.patch.yml', 'file', 'Bundle patch', '2 days ago'],
  ['icon.svg', 'file', 'Hexagram mark', '2 days ago'],
  ['index.js', 'file', 'Host tools: cast and lookup', '1 hour ago'],
  ['package.json', 'file', 'Bundle manifest', '12 minutes ago'],
]

const TOPICS = ['dsh', 'deepseek-harness', 'iching', 'zhouyi', 'divination', 'classical-chinese', 'plugin', 'javascript', 'agent-tools']

const row = ([name, kind, message, when]) => `
  <div class="file-row">
    <span class="file-icon ${kind}">${kind === 'dir' ? folderSvg : fileSvg}</span>
    <span class="file-name"><a href="#">${name}</a></span>
    <span class="commit"><a href="#">${message}</a></span>
    <span class="when">${when}</span>
  </div>`

const folderSvg = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="#54aeff" d="M1.75 1h4.5c.2 0 .4.08.53.22L8.06 2.5H14.25c.97 0 1.75.78 1.75 1.75v8.5c0 .97-.78 1.75-1.75 1.75H1.75A1.75 1.75 0 0 1 0 12.75v-9.5C0 2.3.78 1.5 1.75 1.5Zm0 1.5a.25.25 0 0 0-.25.25v9.5c0 .14.11.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5a.75.75 0 0 1-.53-.22L5.34 2.5H1.75Z"/></svg>'
const fileSvg = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="#8c959f" d="M2 1.75C2 .78 2.78 0 3.75 0h5.5L14 4.75v9.5c0 .97-.78 1.75-1.75 1.75H3.75A1.75 1.75 0 0 1 2 14.25V1.75Zm7.5 .5v3.25H13L9.5 2.25Z"/></svg>'

const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Kochere/dsh-yijing — GitHub preview</title>
<base href="../">
<style>
  :root {
    --fg: #1F2328; --muted: #59636e; --line: #d1d9e0; --line-soft: #eef1f4;
    --canvas: #ffffff; --subtle: #f6f8fa; --accent: #0969da; --open: #1a7f37;
    --btn: #f6f8fa; --btn-border: rgba(31,35,40,.15); --shadow: 0 1px 0 rgba(31,35,40,.04);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--canvas); }
  body { font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; color: var(--fg); }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .mockbar { background: #fff8c5; border-bottom: 1px solid #d4a72c66; color: #7d4e00; font-size: 12px; padding: 7px 32px; text-align: center; }
  .top { background: #24292f; color: #fff; }
  .top-inner { max-width: 1280px; margin: 0 auto; height: 62px; display: flex; align-items: center; gap: 16px; padding: 0 32px; }
  .brand { display: inline-flex; align-items: center; gap: 9px; color: #fff; font-weight: 600; }
  .brand .mark { width: 26px; height: 26px; border-radius: 50%; background: #fff; color: #24292f; display: grid; place-items: center; font-size: 15px; font-weight: 700; }
  .search { flex: 1; max-width: 320px; height: 30px; border: 1px solid #57606a; border-radius: 6px; background: #24292f; color: #b1bac4; display: flex; align-items: center; padding: 0 10px; font-size: 13px; gap: 8px; }
  .search .slash { margin-left: auto; border: 1px solid #57606a; border-radius: 4px; padding: 0 5px; font-size: 11px; color: #8c959f; }
  .nav { display: flex; gap: 16px; font-size: 14px; font-weight: 600; color: #fff; }
  .nav span { opacity: .92; }
  .top-right { margin-left: auto; display: flex; align-items: center; gap: 14px; color: #fff; }
  .dot { width: 20px; height: 20px; border-radius: 4px; background: #30363d; display: inline-block; }
  .avatar { width: 24px; height: 24px; border-radius: 50%; background: #a371f7; color: #fff; display: grid; place-items: center; font-size: 11px; font-weight: 700; }
  .repo-head { max-width: 1280px; margin: 0 auto; padding: 22px 32px 0; }
  .repo-title { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 400; }
  .repo-title .book { width: 18px; height: 18px; color: #59636e; }
  .repo-title b { font-weight: 600; }
  .pill { font-size: 12px; font-weight: 500; border: 1px solid var(--line); color: var(--muted); border-radius: 999px; padding: 0 7px; line-height: 18px; }
  .actions { margin-left: auto; display: flex; gap: 8px; align-items: center; }
  .btn { height: 28px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; border: 1px solid var(--btn-border); background: var(--btn); border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--fg); box-shadow: var(--shadow); }
  .btn .count { background: rgba(31,35,40,.08); border-radius: 999px; padding: 0 6px; font-weight: 600; }
  .btn.star { color: #24292f; }
  .tabs { max-width: 1280px; margin: 16px auto 0; padding: 0 32px; display: flex; gap: 4px; border-bottom: 1px solid var(--line); font-size: 14px; }
  .tab { padding: 8px 12px 10px; color: var(--muted); display: inline-flex; align-items: center; gap: 6px; border-bottom: 2px solid transparent; }
  .tab.active { color: var(--fg); font-weight: 600; border-bottom-color: #fd8c73; }
  .tab .counter { background: rgba(31,35,40,.08); border-radius: 999px; font-size: 11px; padding: 0 6px; }
  .layout { max-width: 1280px; margin: 0 auto; padding: 24px 32px 60px; display: grid; grid-template-columns: minmax(0, 1fr) 296px; gap: 24px; align-items: start; }
  .box { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
  .box-head { background: var(--subtle); border-bottom: 1px solid var(--line); padding: 8px 14px; display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .branch { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; }
  .branch .pill { font-weight: 500; }
  .box-head .right { margin-left: auto; display: flex; gap: 8px; align-items: center; }
  .btn.green { background: #1f883d; border-color: rgba(31,35,40,.15); color: #fff; }
  .file-row { display: grid; grid-template-columns: 22px minmax(0, 1fr) minmax(0, 1.4fr) 92px; gap: 10px; align-items: center; padding: 7px 14px; border-bottom: 1px solid var(--line-soft); font-size: 13px; }
  .file-row:last-child { border-bottom: 0; }
  .file-row:hover { background: #f6f8fa; }
  .file-icon { display: inline-flex; align-items: center; }
  .file-name a { color: var(--fg); }
  .file-name a:hover { color: var(--accent); }
  .commit a { color: var(--muted); font-size: 12.5px; }
  .when { color: var(--muted); font-size: 12px; text-align: right; }
  .readme-box { margin-top: 22px; }
  .readme-head { background: var(--subtle); border: 1px solid var(--line); border-bottom: 0; border-radius: 6px 6px 0 0; padding: 8px 14px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
  .readme-head .right { margin-left: auto; color: var(--muted); font-weight: 400; display: flex; gap: 12px; }
  .markdown-body { border: 1px solid var(--line); border-radius: 0 0 6px 6px; padding: 32px; font-size: 16px; line-height: 1.5; word-wrap: break-word; }
  .markdown-body > *:first-child { margin-top: 0 !important; }
  .markdown-body h1, .markdown-body h2 { border-bottom: 1px solid var(--line-soft); padding-bottom: .3em; }
  .markdown-body h1 { font-size: 2em; margin: .67em 0; font-weight: 600; }
  .markdown-body h2 { font-size: 1.5em; margin-top: 1.6em; margin-bottom: .6em; font-weight: 600; }
  .markdown-body h3 { font-size: 1.25em; margin-top: 1.4em; font-weight: 600; }
  .markdown-body p, .markdown-body ul, .markdown-body ol, .markdown-body table, .markdown-body blockquote { margin-top: 0; margin-bottom: 16px; }
  .markdown-body img { max-width: 100%; box-sizing: content-box; }
  .markdown-body hr { height: 1px; border: 0; background: var(--line); margin: 24px 0; }
  .markdown-body table { border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; }
  .markdown-body th, .markdown-body td { border: 1px solid var(--line); padding: 6px 13px; }
  .markdown-body th { background: var(--subtle); font-weight: 600; }
  .markdown-body code { background: rgba(31,35,40,.06); border-radius: 6px; padding: .2em .4em; font-size: 85%; font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace; }
  .markdown-body pre { background: var(--subtle); border-radius: 6px; padding: 16px; overflow: auto; }
  .markdown-body pre code { background: transparent; padding: 0; }
  .markdown-body blockquote { border-left: .25em solid var(--line); color: var(--muted); padding: 0 1em; }
  .markdown-body ul { padding-left: 2em; }
  .markdown-body li + li { margin-top: .25em; }
  .markdown-body div[align="center"] { text-align: center; }
  .markdown-body div[align="center"] h1 { border-bottom: 0; }
  .markdown-body div[align="center"] img { display: inline-block; }
  .markdown-body p[align="center"] { text-align: center; }
  .side { display: flex; flex-direction: column; gap: 22px; font-size: 12px; }
  .side h3 { margin: 0 0 8px; font-size: 14px; font-weight: 600; }
  .about p { margin: 0 0 12px; color: var(--fg); }
  .topics { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 12px; }
  .topic { background: #ddf4ff; color: #0969da; border-radius: 999px; padding: 0 8px; font-size: 12px; line-height: 22px; }
  .facts { display: flex; flex-direction: column; gap: 9px; color: var(--muted); }
  .facts a { color: var(--accent); }
  .facts .row { display: flex; align-items: center; gap: 7px; }
  .facts b { color: var(--fg); font-weight: 600; }
  .side .box { border: 0; }
  .side .sec { border-bottom: 1px solid var(--line); padding-bottom: 14px; }
  .side .sec:last-child { border-bottom: 0; padding-bottom: 0; }
  .release { display: flex; gap: 8px; align-items: flex-start; }
  .tag { background: #dafbe1; color: #1a7f37; border-radius: 999px; padding: 0 8px; font-size: 11px; font-weight: 600; }
  .avatars { display: flex; gap: -4px; }
  .avatars span { width: 26px; height: 26px; border-radius: 50%; background: #dfe5eb; border: 2px solid #fff; display: grid; place-items: center; font-size: 10px; font-weight: 700; color: #59636e; margin-right: -6px; }
  .lang { height: 8px; border-radius: 999px; background: #f1e05a; margin: 8px 0 4px; }
  .foot { max-width: 1280px; margin: 0 auto; padding: 26px 32px 50px; color: var(--muted); font-size: 12px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; }
</style>

<div class="mockbar">Local mock preview · not an official GitHub page · star/fork counts are illustrative</div>

<header class="top">
  <div class="top-inner">
    <span class="brand"><span class="mark">G</span>GitHub</span>
    <span class="search">Search or jump to… <span class="slash">/</span></span>
    <span class="nav"><span>Pull requests</span><span>Issues</span><span>Marketplace</span><span>Explore</span></span>
    <span class="top-right"><span class="dot"></span><span class="dot"></span><span class="avatar">K</span></span>
  </div>
</header>

<div class="repo-head">
  <div class="repo-title">
    <svg class="book" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M0 1.75C0 .78.78 0 1.75 0h12.5C15.22 0 16 .78 16 1.75v12.5c0 .97-.78 1.75-1.75 1.75H1.75A1.75 1.75 0 0 1 0 14.25V1.75Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .14.11.25.25.25H7V1.5H1.75Z"/></svg>
    <span><a href="#">Kochere</a> / <b><a href="#">dsh-yijing</a></b></span>
    <span class="pill">Public</span>
    <span class="actions">
      <span class="btn">Watch <span class="count">12</span></span>
      <span class="btn">Fork <span class="count">86</span></span>
      <span class="btn star">★ Star <span class="count">1.2k</span></span>
    </span>
  </div>
</div>

<div class="tabs">
  <span class="tab active">Code</span>
  <span class="tab">Issues <span class="counter">3</span></span>
  <span class="tab">Pull requests <span class="counter">1</span></span>
  <span class="tab">Actions</span>
  <span class="tab">Projects</span>
  <span class="tab">Wiki</span>
  <span class="tab">Security</span>
  <span class="tab">Insights</span>
</div>

<div class="layout">
  <main>
    <div class="box">
      <div class="box-head">
        <span class="branch">⎇ main <span class="pill">v1.0.0</span></span>
        <span class="right">
          <span class="btn">Go to file</span>
          <span class="btn">Add file ▾</span>
          <span class="btn green">Code ▾</span>
        </span>
      </div>
      ${FILES.map(row).join('')}
    </div>

    <div class="readme-box">
      <div class="readme-head">
        <span>📖 README.md</span>
        <span class="right"><span>✎</span><span>⋯</span></span>
      </div>
      <div class="markdown-body">${readmeHtml}</div>
    </div>
  </main>

  <aside class="side">
    <div class="sec about">
      <h3>About</h3>
      <p>I Ching coin oracle for DeepSeek Harness — animated cast, Zhu Xi’s change rule, classical Zhouyi text only.</p>
      <div class="topics">${TOPICS.map((t) => `<span class="topic">${t}</span>`).join('')}</div>
      <div class="facts">
        <div class="row">📖 <a href="#">Readme</a></div>
        <div class="row">⚖️ <a href="#">MIT license</a></div>
        <div class="row">★ <b>1.2k</b> stars</div>
        <div class="row">👁 <b>12</b> watching</div>
        <div class="row">⑂ <b>86</b> forks</div>
      </div>
    </div>

    <div class="sec">
      <h3>Releases <span style="float:right;font-weight:400;color:var(--muted)">1</span></h3>
      <div class="release">
        <span class="tag">Latest</span>
        <div><b><a href="#">v1.0.0</a></b><div style="color:var(--muted)">The cast, the text, the card · 12 minutes ago</div></div>
      </div>
    </div>

    <div class="sec">
      <h3>Packages</h3>
      <div style="color:var(--muted)">No packages published</div>
    </div>

    <div class="sec">
      <h3>Contributors <span style="float:right;font-weight:400;color:var(--muted)">3</span></h3>
      <div class="avatars"><span>K</span><span>YJ</span><span>ZY</span></div>
    </div>

    <div class="sec">
      <h3>Languages</h3>
      <div class="lang"></div>
      <div><b>JavaScript</b> <span style="float:right;color:var(--muted)">100%</span></div>
    </div>
  </aside>
</div>

<div class="foot">
  <span>© 2026 dsh-yijing · mock preview for design review</span>
  <span>Not affiliated with GitHub, Inc.</span>
</div>
</html>`

fs.writeFileSync(path.join(outDir, 'github.html'), html)
console.log('wrote preview/github.html')
