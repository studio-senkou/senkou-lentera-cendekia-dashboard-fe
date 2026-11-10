---
name: vitest-conventions
description: Use when writing, adding, fixing or reviewing unit tests in a React + TypeScript project on Vitest + Testing Library — tests for utils, classes, hooks, stores, services, Zod schemas and presentational components. Enforces placement (`test/` mirroring `src/`, `src/features/<f>/test/`), wording (`describe` in plain words, `it('Must <behavior> when <condition>')`), coverage scope and mocking gotchas. Triggers on "write tests", "add a test", "cover this", "test this hook/component/schema".
---

# Vitest conventions

Vitest + Testing Library, jsdom, `globals: true`, `pool: 'vmThreads'`. Every generated logic file ships with its test in the same change.

## What must have a test

Covered: utils, lib classes, hooks, stores, services, feature `schema/` and `utils/`, prop-driven components (cards, badges, summaries, dialogs with callbacks).
Not required: types, constants, re-exports (`index.ts`), routes, components that need the router or React Query.
Fixing a bug means changing or adding the test that would have caught it.

## Placement and naming

- Feature code: `src/features/<feature>/test/<name>.test.ts(x)`.
- Global code: `test/<dir>/<name>.test.ts(x)` mirroring `src/`, e.g. `src/lib/websocket/websocket-backoff.ts` → `test/lib/websocket/websocket-backoff.test.ts`; `src/components/overlays/popover/popover-confirmation.tsx` → `test/components/overlays/popover-confirmation.test.tsx`.
- Same base name as the source. `.tsx` only when the test renders JSX.
- Import the unit through `@/`, never relative.

## Wording (exact)

- `describe` is plain words naming the thing, never a code identifier:
  `describe('Product card')`, `describe('WebSocket reconnect backoff delay')`, `describe('Auth store')`, `describe('Debounce hook')`, `describe('Create product schema')`. Not `describe('ProductCard')`, not `describe('useDebounce')`.
- Nest `describe` for sub-areas: `describe('Date utils', () => { describe('Relative time', …) })`.
- Each `it` reads `Must <behavior> when <condition>`; the `when` clause may be dropped when the behavior is unconditional:
  - `it('Must return the initial value immediately when first rendered')`
  - `it('Must reject the rollout with its path when the day is above 28')`
  - `it('Must show dashes when owner and category are missing')`
  - `it('Must grow the delay exponentially up to the ceiling')`
- Table tests: `it.each([...])('Must parse %s into amount and currency', (input, expected) => …)`.
- Behavior words are concrete: return, display, show, call, reject, accept, store, write, clear, hydrate, retry, emit, skip, ignore.

## What to cover

- Main path plus edges: empty, null/undefined, boundaries (min/max, 0, ceiling), missing optional data.
- Schemas: one valid payload, then one failing case per rule, asserting `success`, `issues[0].path` and `issues[0].message` (the i18n key).
- Components: rendered text, loading/empty states, disabled states, callbacks with their arguments. No snapshots.
- Hooks: `renderHook` + `rerender` with `initialProps`; fake timers for time-based hooks; assert cleanup (`vi.getTimerCount()` after `unmount()`).
- Stores: reset with `store.setState(initialState, true)` in `beforeEach`; assert state via `toMatchObject`; spy side effects (`vi.spyOn(storage, 'setItem')`) and restore.
- Classes: construct with hand-written fakes for injected deps; `// @vitest-environment node` when no DOM needed; fake timers + `vi.advanceTimersByTimeAsync` for schedulers; `vi.waitFor` for async setup.

## Templates

Pure util / class:

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { WebSocketBackoffCalculator } from '@/lib/websocket/websocket-backoff'

describe('WebSocket reconnect backoff delay', () => {
  const options = { baseMs: 1000, ceilingMs: 30_000 }

  it('Must keep the jittered delay within [0, upperBound]', () => {
    for (let i = 0; i < 20; i++) {
      const delay = WebSocketBackoffCalculator.computeDelay(2, options)
      expect(delay).toBeGreaterThanOrEqual(0)
      expect(delay).toBeLessThanOrEqual(4000)
    }
  })
})
```

Class with injected fake:

```ts
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WebSocketTransport } from '@/lib/websocket/websocket-transport'
import type { SocketConstructor } from '@/lib/websocket/transport.types'

class FakeSocket {
  static instances: Array<FakeSocket> = []
  readyState = 0
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  constructor(public url: string) {
    FakeSocket.instances.push(this)
  }
  send() {}
  close() {
    this.readyState = 3
    this.onclose?.({} as CloseEvent)
  }
  triggerOpen() {
    this.readyState = 1
    this.onopen?.({} as Event)
  }
}

const FakeSocketCtor = FakeSocket as unknown as SocketConstructor

beforeEach(() => {
  FakeSocket.instances = []
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WebSocket transport', () => {
  it('Must retry after the connection drops', async () => {
    const transport = new WebSocketTransport({
      socketCtor: FakeSocketCtor,
      resolveUrl: () => 'wss://example.test',
    })

    transport.connect()
    await vi.waitFor(() => expect(FakeSocket.instances.length).toBe(1))
    FakeSocket.instances[0].triggerOpen()
    FakeSocket.instances[0].close()

    await vi.advanceTimersByTimeAsync(30_000)

    expect(FakeSocket.instances.length).toBe(2)
    transport.disconnect()
  })
})
```

Component:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import '@/i18n/i18n'
import { ProductCard } from '@/features/product/components/product-card'

const product = { id: 1, name: 'Desk Lamp', price: 25, status: 'active' } as any

describe('Product card', () => {
  it('Must call onArchive with the product when archiving is confirmed in the dialog', () => {
    const onArchive = vi.fn()
    render(<ProductCard product={product} isSaving={false} onArchive={onArchive} />)

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
    const dialog = screen.getByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    expect(onArchive).toHaveBeenCalledWith(product)
  })
})
```

Schema:

```ts
import { describe, expect, it, vi } from 'vitest'
import { createProductSchema } from '@/features/product/schema'

vi.mock('i18next', () => ({ t: (key: string) => key }))

describe('Create product schema', () => {
  it('Must accept the product when a category id is a number', () => {
    expect(createProductSchema.safeParse({ category_id: 3 }).success).toBe(true)
  })

  it('Must reject the product with the required key when the category id is missing', () => {
    const result = createProductSchema.safeParse({})

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['category_id'])
    expect(result.error?.issues[0]?.message).toBe('form.error.category_required')
  })
})
```

Hook:

```ts
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from '@/hooks/use-debounce'

describe('Debounce hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Must clear the pending timer when the component unmounts', () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    expect(vi.getTimerCount()).toBe(1)

    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
```

## Gotchas

- `vi.restoreAllMocks()` does not reset `vi.mock` factories; reset them in `beforeEach`.
- Mock env with `const env = vi.hoisted(() => ({ VITE_APP_ENV: 'production' }))` + `vi.mock('@/env', () => ({ env }))`, then mutate `env.X` per test. Never assign to the real env module.
- Import `@/i18n/i18n` to render real translations; mock `i18next` `t` as identity when asserting message keys.
- In the `vmThreads` pool `window.location` cannot be stubbed; use `jsdom.reconfigure({ url })`.
- Module-load behavior (hydration from storage or cookies): set state, `vi.resetModules()`, then `await import('@/…')`.
- jsdom drops `secure` cookies on http; assert cookie writes with a spy instead.
- Use short inline comments only when an assertion is not self-evident (`// no pong arrives -> force close`).

## Pre-commit

Husky pre-commit: prettier on staged files, `oxlint`, warn when a new logic file has no `<name>.test.ts(x)`, `vitest related --run` on staged TS files. Pre-push: `npm run build`.
