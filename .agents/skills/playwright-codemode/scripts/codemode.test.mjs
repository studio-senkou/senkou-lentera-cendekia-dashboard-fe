import { describe, it } from 'node:test'
import assert from 'node:assert'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { generate } from './codemode.mjs'

const CLI = fileURLToPath(new URL('./codemode.mjs', import.meta.url))
const run = (plan) =>
  spawnSync('node', [CLI, '-'], { input: JSON.stringify(plan), encoding: 'utf8' })
const compileFn = (plan) => new Function('return ' + generate(plan))()

function fakePage({ failClick = false } = {}) {
  const calls = []
  const loc = (desc) => {
    const o = {
      first: () => o,
      nth: (n) => loc(`${desc}#${n}`),
      click: async () => {
        if (failClick) throw new Error('boom\nsecond line')
        calls.push(`click ${desc}`)
      },
      fill: async (v) => calls.push(`fill ${desc} ${v}`),
      innerText: async () => '  Hello  ',
      count: async () => 3,
      isVisible: async () => true,
    }
    return o
  }
  return {
    calls,
    setDefaultTimeout() {},
    on() {},
    url: () => 'http://x/y',
    goto: async (u) => calls.push(`goto ${u}`),
    locator: (s) => loc(`locator:${s}`),
    getByText: (s) => loc(`text:${s}`),
    getByRole: (r, o) => loc(`role:${r}:${o?.name}`),
  }
}

describe('Codemode generator', () => {
  it('Must use getByText when a plain string target is given', () => {
    const src = generate({ steps: [{ click: 'Save' }] })
    assert.match(src, /page\.getByText\("Save", \{ exact: false \}\)\.first\(\)/)
  })

  it('Must use page.locator when a string target starts with a css prefix', () => {
    assert.match(generate({ steps: [{ click: '#a' }] }), /page\.locator\("#a"\)/)
  })

  it('Must use getByRole when an object target has a role', () => {
    const src = generate({ steps: [{ click: { role: 'button', name: 'Save' } }] })
    assert.match(src, /getByRole\("button", \{ name: "Save" \}\)\.first\(\)/)
    assert.match(src, /click role=button\[Save\]/)
  })

  it('Must exit 1 with step index when the verb is unknown', () => {
    const r = run({ steps: [{ click: 'a' }, { dance: 'x' }] })
    assert.strictEqual(r.status, 1)
    assert.match(r.stderr, /^step 1: /)
  })

  it('Must exit 1 with step index when a required field is missing', () => {
    const r = run({ steps: [{ fill: '#a' }] })
    assert.strictEqual(r.status, 1)
    assert.match(r.stderr, /^step 0: .*value/)
  })

  it('Must emit a parseable function when the plan is valid', () => {
    const r = run({ steps: [{ goto: '/' }] })
    assert.strictEqual(r.status, 0)
    assert.strictEqual(typeof new Function('return ' + r.stdout)(), 'function')
  })
})

describe('Generated function', () => {
  const plan = {
    base: 'http://x',
    steps: [
      { goto: '/a' },
      { fill: { label: 'Email' }, value: 'q' },
      { click: { role: 'button', name: 'Go' } },
      { text: '#t', as: 't' },
      { count: '.row', as: 'n' },
    ],
  }

  it('Must return a terse ok digest when every step passes', async () => {
    const page = fakePage()
    page.getByLabel = (s) => ({ fill: async () => {}, first() { return this } })
    const r = await compileFn(plan)(page)
    assert.deepStrictEqual(r, {
      ok: true,
      url: 'http://x/y',
      steps: 5,
      data: { t: 'Hello', n: 3 },
    })
    assert.ok(page.calls.includes('goto http://x/a'))
  })

  it('Must report the failing step and stop when a step throws', async () => {
    const page = fakePage({ failClick: true })
    const r = await compileFn({
      steps: [{ click: '#a' }, { click: '#b' }],
    })(page)
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.steps, 0)
    assert.deepStrictEqual(r.fail, { i: 0, step: 'click #a', error: 'boom' })
  })
})
