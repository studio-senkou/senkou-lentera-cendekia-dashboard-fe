#!/usr/bin/env node
// Compile a JSON step plan into ONE async (page) => digest function for
// the Playwright MCP tool browser_run_code_unsafe.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const HELP = `codemode.mjs plan.json | echo '<json>' | codemode.mjs -
Plan: { base?, timeout?=5000, stopOnFail?=true, steps: [...] }
Steps:
  goto "/p"                      click T            check T
  fill T, value                  select T, value    press "Key", on?: T
  wait T | wait ms               waitUrl "/p"
  expect T, text?, visible?, count?
  text T, as      count T, as    attr T, name, as
  eval "() => x", as             console "errors", as     shot "a.png"
Target T: "role=.."|"text=.."|"css=.."|"#id"|".cls"|"[a]"|"//xp" -> locator;
  other string -> getByText(substring);
  { role, name? } | { label } | { testid } | { placeholder }, nth? (default first)`

const VERBS = [
  'goto', 'click', 'fill', 'select', 'press', 'check', 'wait', 'waitUrl',
  'expect', 'text', 'count', 'attr', 'eval', 'console', 'shot',
]
const NEED = {
  fill: ['value'], select: ['value'], text: ['as'], count: ['as'],
  attr: ['name', 'as'], eval: ['as'], console: ['as'],
}
const RAW = /^(role=|text=|css=|xpath=|#|\.|\[|\/\/)/
const J = JSON.stringify

function target(t, multi) {
  let e
  if (typeof t === 'string') {
    return RAW.test(t)
      ? `page.locator(${J(t)})${multi ? '' : '.first()'}`
      : `page.getByText(${J(t)}, { exact: false })${multi ? '' : '.first()'}`
  }
  if (t.role) e = `page.getByRole(${J(t.role)}${t.name ? `, { name: ${J(t.name)} }` : ''})`
  else if (t.label) e = `page.getByLabel(${J(t.label)})`
  else if (t.testid) e = `page.getByTestId(${J(t.testid)})`
  else if (t.placeholder) e = `page.getByPlaceholder(${J(t.placeholder)})`
  else throw new Error('bad target')
  if (t.nth !== undefined) return `${e}.nth(${Number(t.nth)})`
  return multi ? e : `${e}.first()`
}

function label(t) {
  if (typeof t === 'string') return t
  if (t.role) return `role=${t.role}${t.name ? `[${t.name}]` : ''}`
  const k = ['label', 'testid', 'placeholder'].find((k) => t[k])
  return `${k}=${t[k]}`
}

function compile(s, i, base) {
  const verb = 'expect' in s ? 'expect' : VERBS.find((v) => v in s)
  if (!verb) throw new Error(`step ${i}: unknown verb "${Object.keys(s)[0]}"`)
  for (const f of NEED[verb] || []) {
    if (s[f] === undefined) throw new Error(`step ${i}: ${verb} needs "${f}"`)
  }
  const v = s[verb]
  const tg = (m) => {
    try { return target(v, m) } catch { throw new Error(`step ${i}: bad target`) }
  }
  const put = (e) => `d[${J(s.as)}] = ${e}`
  let name = `${verb} ${typeof v === 'number' || verb === 'goto' || verb === 'waitUrl' || verb === 'press' || verb === 'shot' || verb === 'eval' || verb === 'console' ? v : label(v)}`
  let body
  switch (verb) {
    case 'goto': {
      const u = /^https?:/.test(v) || !base ? v : base.replace(/\/$/, '') + v
      body = `await page.goto(${J(u)})`
      break
    }
    case 'click': body = `await ${tg()}.click()`; break
    case 'check': body = `await ${tg()}.check()`; break
    case 'fill': body = `await ${tg()}.fill(${J(s.value)})`; break
    case 'select': body = `await ${tg()}.selectOption(${J(s.value)})`; break
    case 'press':
      body = s.on
        ? `await ${target(s.on)}.press(${J(v)})`
        : `await page.keyboard.press(${J(v)})`
      break
    case 'wait':
      body = typeof v === 'number'
        ? `await page.waitForTimeout(${v})`
        : `await ${tg()}.waitFor()`
      break
    case 'waitUrl': body = `await page.waitForURL(${J('**' + v)})`; break
    case 'expect': {
      const c = []
      const L = tg(s.count !== undefined)
      if (s.visible !== undefined) c.push(`if ((await L.isVisible()) !== ${!!s.visible}) throw new Error('visible!=${!!s.visible}')`)
      if (s.text !== undefined) c.push(`if (!(await L.innerText()).includes(${J(s.text)})) throw new Error('text missing: ' + ${J(s.text)})`)
      if (s.count !== undefined) c.push(`{ const n = await L.count(); if (n !== ${Number(s.count)}) throw new Error('count ' + n + '!=${Number(s.count)}') }`)
      if (!c.length) c.push(`if ((await L.count()) < 1) throw new Error('not found')`)
      body = `const L = ${L}; ${c.join('; ')}`
      break
    }
    case 'text': body = put(`(await ${tg()}.innerText()).trim().slice(0, 200)`); break
    case 'count': body = put(`await ${tg(true)}.count()`); break
    case 'attr': body = put(`await ${tg()}.getAttribute(${J(s.name)})`); break
    case 'eval': body = put(`await page.evaluate(${J(`(${v})()`)})`); break
    case 'console': body = put('con.slice()'); break
    case 'shot': body = `await page.screenshot({ path: ${J(v)} })`; break
  }
  return `[${J(name)}, async () => { ${body} }]`
}

export function generate(plan) {
  if (!plan || !Array.isArray(plan.steps)) throw new Error('plan.steps must be an array')
  const items = plan.steps.map((s, i) => compile(s, i, plan.base))
  const usesCon = plan.steps.some((s) => 'console' in s)
  return `async (page) => {
  const d = {}
  const r = { ok: true, url: '', steps: 0, data: d }
  ${usesCon ? `const con = []
  page.on('console', (m) => { if (m.type() === 'error') con.push(m.text().slice(0, 200)) })` : ''}
  page.setDefaultTimeout(${Number(plan.timeout ?? 5000)})
  const S = [
    ${items.join(',\n    ')},
  ]
  for (let i = 0; i < S.length; i++) {
    try {
      await S[i][1]()
      r.steps++
    } catch (e) {
      r.ok = false
      r.fail ??= { i, step: S[i][0], error: String((e && e.message) || e).split('\\n')[0].slice(0, 160) }
      if (${plan.stopOnFail !== false}) break
    }
  }
  r.url = page.url()
  return r
}`
}

function main() {
  const a = process.argv[2]
  if (!a || a === '--help' || a === '-h') {
    console.log(HELP)
    return
  }
  try {
    console.log(generate(JSON.parse(readFileSync(a === '-' ? 0 : a, 'utf8'))))
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
