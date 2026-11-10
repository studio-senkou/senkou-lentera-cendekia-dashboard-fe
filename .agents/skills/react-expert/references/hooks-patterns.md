# Hooks Patterns

## Hook taxonomy

Every custom hook falls into one of three kinds. Decide the kind first; it decides the folder.

| Kind                         | What it is                                                                                                                     | Lives in                                                | Examples                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Primitive shared hook** | Generic, domain-free behavior any component can use. Wraps React primitives or one browser API. Knows nothing about features.  | `src/hooks/use-<thing>.ts`                              | `use-debounce`, `use-disclose`, `use-mobile`, `use-media-query`, `use-timer`, `use-temporary`                                                                      |
| **2. Composite shared hook** | Combines other hooks (primitives, React Query, form, store) into one reusable unit so components stay thin. Still domain-free. | `src/hooks/use-<thing>.ts`                              | `use-table-state` (pagination + sort + filter), `use-async-action` (loading + callbacks), `use-search` (input + debounce + reset page), `use-date-range-shortcuts` |
| **3. Feature hook**          | Composite hook tied to one feature's schema, types or services.                                                                | `src/features/<feature>/hooks/use-<feature>-<thing>.ts` | `use-product-form` (react-hook-form + schema + default values)                                                                                                     |

Rules:

- **Primitive hooks don't import other custom hooks.** If it needs another custom hook, it is composite.
- **Composite hooks exist to remove bulk from components.** Move logic out of a component into a composite hook when the component has ≥3 related hook calls working together (state + effect + callback, form + schema + defaults, query + table state), or when the same combination appears in 2+ components.
- **Composite hooks stay domain-free** if they live in `src/hooks`. The moment one imports a feature's schema, type or service, it is a feature hook and moves to that feature's `hooks/`.
- **A feature hook used by 2+ features** gets generalized (inputs as params, no feature imports) and promoted to `src/hooks`.
- **No JSX from hooks.** Return values and callbacks; `.tsx` hooks only when they must render (e.g. a portal).
- **One hook per file**, file name = hook name in kebab-case. Exported as a named `const` arrow function or `function`.
- **Typed inputs and outputs.** Options object typed as `Use<Thing>Props` (or `Options`); export a `Use<Thing>Return` type when consumers need it. Generics where the hook is data-agnostic (`useAsyncAction<TArgs, TReturn>`).
- **Stable return.** Wrap returned callbacks in `useCallback` and the returned object in `useMemo` when consumers pass them to memoized children or effect deps.
- **Every shared hook has a test**: `test/hooks/<name>.test.ts`; feature hooks in `src/features/<feature>/test/` (see `testing-react.md`).

## 1. Primitive shared hook

```ts
// src/hooks/use-disclose.ts
import { useCallback, useMemo, useState } from 'react'

export const useDisclose = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const onOpen = useCallback(() => setIsOpen(true), [])
  const onClose = useCallback(() => setIsOpen(false), [])
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), [])
  const onChange = useCallback((open: boolean) => setIsOpen(open), [])

  return useMemo(
    () => ({ isOpen, onOpen, onClose, onToggle, onChange }),
    [isOpen, onOpen, onClose, onToggle, onChange],
  )
}
```

```ts
// src/hooks/use-debounce.ts
import { useEffect, useState } from 'react'

export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

```ts
// src/hooks/use-media-query.ts
import { useEffect, useState } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

## 2. Composite shared hook

Combines hooks so the component reads as intent, not plumbing.

```ts
// src/hooks/use-async-action.ts
import { useCallback, useState } from 'react'

type AsyncFunction<TArgs extends Array<unknown>, TReturn> = (
  ...args: TArgs
) => Promise<TReturn>

interface UseAsyncActionOptions<TArgs extends Array<unknown>, TReturn> {
  action: AsyncFunction<TArgs, TReturn>
  onSuccess?: (data: TReturn, ...args: TArgs) => void
  onError?: (error: unknown, ...args: TArgs) => void
}

export function useAsyncAction<TArgs extends Array<unknown>, TReturn>({
  action,
  onSuccess,
  onError,
}: UseAsyncActionOptions<TArgs, TReturn>) {
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true)
      try {
        const data = await action(...args)
        onSuccess?.(data, ...args)
        return data
      } catch (error) {
        onError?.(error, ...args)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [action, onSuccess, onError],
  )

  return { execute, isLoading }
}
```

```ts
// src/hooks/use-search.ts — composes a primitive (useDebounce) with table state
import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

interface UseSearchProps {
  delay?: number
  onSearch: (value: string) => void
}

export const useSearch = ({ delay = 300, onSearch }: UseSearchProps) => {
  const [value, setValue] = useState('')
  const debounced = useDebounce(value, delay)

  useEffect(() => {
    onSearch(debounced)
  }, [debounced, onSearch])

  return { value, setValue, reset: () => setValue('') }
}
```

Before / after in a component:

```tsx
// Before: bulky component wiring pagination, sorting, filters and search by hand
const [page, setPage] = useState(1)
const [sorters, setSorters] = useState<SorterState>({})
const [filters, setFilters] = useState<FilterState>({})
const [query, setQuery] = useState('')
const debounced = useDebounce(query)
useEffect(() => setPage(1), [debounced, filters])
// …

// After: one composite hook, component keeps only rendering
const { tablePagination, tableProps, handleTableSort, handleSearch } =
  useTableStates({ defaultTableProps: { sorters: { created_at: 'desc' } } })
```

## 3. Feature hook

```ts
// src/features/product/hooks/use-product-form.ts
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getProductSchema } from '@/features/product/schema'
import type { ProductFormSchema } from '@/features/product/schema'
import type { Product } from '@/features/product/types'

export interface UseProductFormProps {
  isCreate?: boolean
  defaultValues?: Product
}

export const useProductForm = ({
  isCreate,
  defaultValues,
}: UseProductFormProps) => {
  const schema = useMemo(() => getProductSchema({ isCreate }), [isCreate])

  return useForm<ProductFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { status: 'draft' },
  })
}
```

## useCallback and useMemo

```ts
// useCallback: stable function for memoized children or effect deps
const handleSelect = useCallback((id: string) => setSelected(id), [])

// useMemo: expensive derivation whose deps rarely change
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items],
)
```

Don't memoize cheap values by reflex; memoize when a memoized child, an effect dependency, or a measured cost needs it.

## Effect cleanup

```ts
useEffect(() => {
  const unsubscribe = transport.onMessage(handler)
  return unsubscribe
}, [transport])

// Async effect guard
useEffect(() => {
  let cancelled = false

  const load = async () => {
    const data = await getData()
    if (!cancelled) setData(data)
  }

  void load()
  return () => {
    cancelled = true
  }
}, [])
```

Server data belongs in TanStack Query (`useQuery` / `useMutation` over a service function), not in a hand-written fetch effect.

## Quick reference

| Built-in             | Purpose                                     |
| -------------------- | ------------------------------------------- |
| useState             | Component state                             |
| useEffect            | Side effects, subscriptions                 |
| useCallback          | Stable function reference                   |
| useMemo              | Memoized derived value                      |
| useRef               | Mutable ref, DOM access, latest-handler ref |
| useContext           | Read context                                |
| useReducer           | Complex local state transitions             |
| useSyncExternalStore | Subscribe to a class/store outside React    |

| Need                                                         | Kind      | Folder                   |
| ------------------------------------------------------------ | --------- | ------------------------ |
| Debounce, toggle, media query, timer                         | Primitive | `src/hooks`              |
| Table state, async action, search, date range shortcuts      | Composite | `src/hooks`              |
| Form for one feature, feature-specific query + derived state | Feature   | `src/features/<f>/hooks` |
