# Testing React

Vitest + Testing Library. The full convention set (placement, wording, coverage, gotchas) lives in the `vitest-conventions` skill; load it when writing tests. This page is the React-specific quick guide.

## Must-follow conventions

- **Placement:** global code in `test/<dir>/<name>.test.ts(x)` mirroring `src/` (`src/hooks/use-debounce.ts` → `test/hooks/use-debounce.test.ts`); feature code in `src/features/<feature>/test/<name>.test.ts(x)`. Same base name; `.tsx` only when rendering JSX; import via `@/`.
- **`describe` in plain words**, never an identifier: `describe('Debounce hook')`, `describe('Product card')`. Not `describe('useDebounce')`.
- **Each `it` reads `Must <behavior> when <condition>`**: `it('Must emit the latest value only after the delay when input changes rapidly')`.
- **Cover** the main path plus edges (empty, null, boundaries). Components: rendered text, loading/empty states, disabled states, callbacks with their arguments. **No snapshots.**
- Explicit imports from `vitest` (`describe`, `expect`, `it`, `vi`), even with globals on.

## Component test

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import '@/i18n/i18n'
import { ProductCard } from '@/features/product/components/product-card'

const product = { id: 1, name: 'Desk Lamp', price: 25, status: 'active' } as any

describe('Product card', () => {
  it('Must display the name and formatted price when the product is active', () => {
    render(
      <ProductCard product={product} isSaving={false} onArchive={vi.fn()} />,
    )

    expect(screen.getByText('Desk Lamp')).toBeTruthy()
    expect(screen.getByText('$25.00')).toBeTruthy()
  })

  it('Must disable the archive button when saving is in progress', () => {
    render(<ProductCard product={product} isSaving onArchive={vi.fn()} />)

    expect(
      (screen.getByRole('button', { name: 'Archive' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })

  it('Must call onArchive with the product when the archive button is clicked', () => {
    const onArchive = vi.fn()
    render(
      <ProductCard product={product} isSaving={false} onArchive={onArchive} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Archive' }))

    expect(onArchive).toHaveBeenCalledWith(product)
  })
})
```

## Primitive hook test

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

  it('Must return the initial value immediately when first rendered', () => {
    const { result } = renderHook(() => useDebounce('a'))

    expect(result.current).toBe('a')
  })

  it('Must clear the pending timer when the component unmounts', () => {
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })
    expect(vi.getTimerCount()).toBe(1)

    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
```

## Composite hook test

Test the combined behavior through the hook's public return, not the hooks it wraps.

```ts
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAsyncAction } from '@/hooks/use-async-action'

describe('Async action hook', () => {
  it('Must call onSuccess with the result when the action resolves', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useAsyncAction({ action: async (id: number) => id * 2, onSuccess }),
    )

    await act(async () => {
      await result.current.execute(2)
    })

    expect(onSuccess).toHaveBeenCalledWith(4, 2)
    expect(result.current.isLoading).toBe(false)
  })

  it('Must rethrow and call onError when the action rejects', async () => {
    const onError = vi.fn()
    const error = new Error('boom')
    const { result } = renderHook(() =>
      useAsyncAction({ action: async () => Promise.reject(error), onError }),
    )

    await act(async () => {
      await expect(result.current.execute()).rejects.toBe(error)
    })

    expect(onError).toHaveBeenCalledWith(error)
  })
})
```

## Query priority

```ts
screen.getByRole('button', { name: 'Save' }) // preferred
screen.getByLabelText('Email')
screen.getByPlaceholderText('Search…')
screen.getByText('Welcome')
screen.getByTestId('confirm-x') // fallback when no accessible name
await screen.findByText('Loaded') // async
expect(screen.queryByText('Error')).toBeNull() // assert absence
```

## Mocking

- **Services:** mock the feature service module, not HTTP.

  ```ts
  const getProduct = vi.hoisted(() => vi.fn())
  vi.mock('@/features/product/services/product-action', () => ({ getProduct }))

  beforeEach(() => {
    getProduct.mockReset()
  })
  ```

- **Env:** `const env = vi.hoisted(() => ({ VITE_APP_ENV: 'production' }))` + `vi.mock('@/env', () => ({ env }))`.
- **Translations:** import `@/i18n/i18n` to render real text; mock `i18next` `t` as identity when asserting keys.
- **Timers:** `vi.useFakeTimers()` in `beforeEach`, `vi.useRealTimers()` in `afterEach`.
- `vi.restoreAllMocks()` does not reset `vi.mock` factories; reset them in `beforeEach`.

## What not to test here

Components that need the router or React Query are not required to have unit tests. Extract their logic into a hook, util or prop-driven child, and test that instead.
