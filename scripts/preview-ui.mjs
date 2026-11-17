#!/usr/bin/env node
/**
 * Renders client.js outside DSH for visual review.
 *
 * A ~70-line React shim evaluates the real component with the real CSS and a
 * real tool-result payload, then writes a static HTML page. Screenshot it with
 * a headless browser at different virtual-time budgets to inspect the
 * animation. This is a development aid, not shipped runtime code.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { replayReading, renderReading } from '../lib/reading.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const outDir = path.join(root, '.out')
fs.mkdirSync(outDir, { recursive: true })

const question = '这个方案可行吗？'
const values = [6, 8, 9, 7, 7, 6]
const reading = replayReading(question, values)
const text = renderReading(reading)
const meta = {
  v: 1,
  question,
  ben: reading.ben.number,
  bian: reading.bian.number,
  moving: reading.moving,
  ruleId: reading.ruling.rule,
  lines: reading.lines.map((l) => ({ pos: l.pos, name: l.name, value: l.value, yin: l.yin, moving: l.moving, coins: l.coins })),
}

const SHIM = `
window.__MiniReact = (() => {
  const Fragment = Symbol('Fragment')
  let slots = []
  let cursor = 0
  const reset = () => { slots = []; cursor = 0 }
  const createElement = (type, props, ...children) => ({
    type,
    props: { ...(props || {}), children: children.flat(Infinity).filter((c) => c != null && c !== false && c !== true) },
  })
  const useState = (init) => {
    const i = cursor++
    if (!(i in slots)) slots[i] = typeof init === 'function' ? init() : init
    return [slots[i], (next) => { slots[i] = typeof next === 'function' ? next(slots[i]) : next }]
  }
  const useRef = (init) => {
    const i = cursor++
    if (!(i in slots)) slots[i] = { current: init }
    return slots[i]
  }
  const useMemo = (fn) => fn()
  const useEffect = () => {}
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const kebab = (k) => k.startsWith('--') ? k : k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
  const styleText = (obj) => Object.keys(obj).filter((k) => obj[k] != null).map((k) => kebab(k) + ':' + obj[k]).join(';')
  const ATTR = new Set(['viewBox', 'aria-hidden', 'aria-label', 'xmlns', 'role', 'title', 'type'])
  function renderNode(node) {
    if (node == null || node === false || node === true) return ''
    if (Array.isArray(node)) return node.map(renderNode).join('')
    if (typeof node === 'string' || typeof node === 'number') return esc(node)
    if (node.type === Fragment) return renderNode(node.props.children)
    if (typeof node.type === 'function') return renderNode(node.type(node.props))
    if (node.type === 'style') return '<style>' + node.props.children + '</style>'
    const attrs = []
    for (const k of Object.keys(node.props)) {
      if (k === 'children') continue
      const v = node.props[k]
      if (v == null || v === false) continue
      if (k === 'key') continue
      if (k === 'className') { attrs.push('class="' + esc(v) + '"'); continue }
      if (k === 'style' && typeof v === 'object') { attrs.push('style="' + esc(styleText(v)) + '"'); continue }
      if (k.startsWith('on') && typeof v === 'function') continue
      const name = ATTR.has(k) ? k : kebab(k)
      attrs.push(name + '="' + esc(v) + '"')
    }
    return '<' + node.type + (attrs.length ? ' ' + attrs.join(' ') : '') + '>' + renderNode(node.props.children) + '</' + node.type + '>'
  }
  const render = (node) => renderNode(node)
  return { createElement, useState, useRef, useMemo, useEffect, Fragment, render, reset }
})()
`

function page(phase) {
  const block = phase === 'result'
    ? { content: [{ type: 'text', text }], meta, args: { text: (k) => (k === 'question' ? question : undefined) }, call: { name: 'yijing_cast', argsRaw: JSON.stringify({ question }) }, subCalls: [] }
    : undefined
  const props = phase === 'result'
    ? { phase: 'result', toolName: 'yijing_cast', callId: 'preview', block }
    : { phase: 'start', toolName: 'yijing_cast', callId: 'preview', block: { name: 'yijing_cast', argsRaw: JSON.stringify({ question }), args: { text: (k) => (k === 'question' ? question : undefined) }, subCalls: [] } }
  return `<!doctype html>
<meta charset="utf-8">
<title>yijing ${phase}</title>
<style>
  :root {
    --dsw-alias-bg-layer-1: #fbf8f0;
    --dsw-alias-label-primary: #211d19;
    --dsw-alias-label-secondary: #6f665c;
    --dsw-alias-border-l1: #dbd2c2;
    background: #f3f1ea;
  }
  :root.dark {
    --dsw-alias-bg-layer-1: #1b1a18;
    --dsw-alias-label-primary: #f2ede4;
    --dsw-alias-label-secondary: #a49a8c;
    --dsw-alias-border-l1: #3a3732;
    background: #101113;
  }
  html, body { margin: 0; background: inherit; }
  body { padding: 22px; font: 13px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif; }
  #root { max-width: 640px; margin: 0 auto; }
  .yj-bar { max-width: 128px; }
</style>
<script>if (location.search.includes('dark')) document.documentElement.classList.add('dark')</script>
<div id="root"></div>
<script>${SHIM}</script>
<script>window.__ModuleLoader__ = { load(def) { window.__YJ = def } }</script>
<script src="file://${root}/client.js"></script>
<script>
  const React = window.__MiniReact
  const mod = window.__YJ.factory((name) => {
    if (name === 'react') return React
    throw new Error('unexpected require: ' + name)
  })
  const Comp = mod.__yijing && mod.__yijing.card
  if (!Comp) throw new Error('card component missing')
  const props = ${JSON.stringify(props)}
  React.reset()
  document.getElementById('root').innerHTML = React.render(React.createElement(Comp, props))
  window.__YJ_READY = { options: window.__YJ_OPTIONS, html: document.getElementById('root').innerHTML.length }
</script>
`
}

function demoPage() {
  const resultProps = {
    phase: 'result',
    toolName: 'yijing_cast',
    callId: 'preview',
    block: {
      content: [{ type: 'text', text }],
      meta,
      args: { text: (k) => (k === 'question' ? question : undefined) },
      call: { name: 'yijing_cast', argsRaw: JSON.stringify({ question }) },
      subCalls: [],
    },
  }
  const startProps = {
    phase: 'start',
    toolName: 'yijing_cast',
    callId: 'preview',
    block: { name: 'yijing_cast', argsRaw: JSON.stringify({ question }), args: { text: () => question }, subCalls: [] },
  }
  return `<!doctype html>
<meta charset="utf-8">
<title>yijing demo</title>
<style>
  :root {
    --dsw-alias-bg-layer-1: #fbf8f0;
    --dsw-alias-label-primary: #211d19;
    --dsw-alias-label-secondary: #6f665c;
    --dsw-alias-border-l1: #dbd2c2;
    background: #f7f4ec;
  }
  html, body { margin: 0; background: inherit; }
  body { padding: 20px; font: 13px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif; }
  #root { max-width: 640px; margin: 0 auto; }
</style>
<div id="root"></div>
<script>${SHIM}</script>
<script>window.__ModuleLoader__ = { load(def) { window.__YJ = def } }</script>
<script src="file://${root}/client.js"></script>
<script>
  const React = window.__MiniReact
  const mod = window.__YJ.factory((name) => {
    if (name === 'react') return React
    throw new Error('unexpected require: ' + name)
  })
  const Comp = mod.__yijing && mod.__yijing.card
  if (!Comp) throw new Error('card component missing')
  const startProps = ${JSON.stringify(startProps)}
  const resultProps = ${JSON.stringify(resultProps)}
  const root = document.getElementById('root')
  React.reset()
  root.innerHTML = React.render(React.createElement(Comp, startProps))
  setTimeout(() => {
    React.reset()
    root.innerHTML = React.render(React.createElement(Comp, resultProps))
  }, 1200)
</script>
`
}

fs.writeFileSync(path.join(outDir, 'preview-demo.html'), demoPage())

for (const phase of ['result', 'start']) {
  const file = path.join(outDir, `preview-${phase}.html`)
  fs.writeFileSync(file, page(phase))
  console.log(file)
}
console.log('cast:', reading.ben.fullName, '->', reading.bian.fullName, reading.moving)
