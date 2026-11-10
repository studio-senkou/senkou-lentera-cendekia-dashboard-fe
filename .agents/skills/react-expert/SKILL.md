---
name: react-expert
description: Use when building React 19 client components in .tsx files for a Vite single-page app — creating components, writing custom hooks (primitive, composite or feature hooks), debugging rendering issues, state management (local, Context, Zustand, TanStack Query), performance, and React 19 client features (use(), useActionState, useOptimistic, ref as prop). Client components only; no Server Components or Next.js. Triggers on React, JSX, hooks, useState, useEffect, custom hook, Suspense, TanStack Query, Zustand, component.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: '2.0.0'
  domain: frontend
  triggers: React, JSX, hooks, custom hook, useState, useEffect, useContext, React 19, Suspense, TanStack Query, Zustand, component, frontend
  role: specialist
  scope: implementation
  output-format: code
  related-skills: react-bulletproof, typescript-oop, vitest-conventions, baseline-ui
---

# React Expert

Senior React specialist for React 19 **client-side** applications (Vite SPA, TypeScript strict). No Server Components, no `'use client'` / `'use server'` directives, no class components.

## When to Use This Skill

- Building new React components or features
- Writing custom hooks, or extracting bulky component logic into hooks
- State management (local, Context, Zustand, TanStack Query)
- Performance work (memo, lazy, virtualization)
- React 19 client features (`use()`, `useActionState`, `useOptimistic`, ref as prop)

Where files go is the `react-bulletproof` skill; classes are `typescript-oop`; test conventions are `vitest-conventions`.

## Core Workflow

1. **Analyze** — component hierarchy, state needs, data flow.
2. **Reuse** — check `src/hooks` and `src/components` before writing anything new.
3. **Choose patterns** — state location, data fetching (TanStack Query over a service fn), hook kind (see below).
4. **Implement** — TypeScript components and hooks, one component per file.
5. **Validate** — `tsc --noEmit` (or `npm run build`) until clean.
6. **Test** — write the test per `references/testing-react.md` (`describe` in plain words, `it('Must <behavior> when <condition>')`); fix failures before submitting.
7. **Format** — `npm run check` (prettier + oxlint).

## Reference Guide

| Topic            | Reference                         | Load When                                         |
| ---------------- | --------------------------------- | ------------------------------------------------- |
| Hooks            | `references/hooks-patterns.md`    | Custom hooks, hook kinds, useEffect, useCallback  |
| State Management | `references/state-management.md`  | Context, Zustand, TanStack Query                  |
| React 19         | `references/react-19-features.md` | use(), useActionState, useOptimistic, ref as prop |
| Performance      | `references/performance.md`       | memo, lazy, virtualization                        |
| Testing          | `references/testing-react.md`     | Component and hook tests                          |

## Hook kinds (decide before writing a hook)

| Kind                      | Purpose                                                                                                                                      | Folder                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Primitive shared hook** | Generic behavior any component can use (debounce, disclosure, media query, timer). Doesn't call other custom hooks.                          | `src/hooks/use-<thing>.ts`                  |
| **Composite shared hook** | Combines other hooks (primitives, query, form, store) into one domain-free unit so components stay thin (table state, async action, search). | `src/hooks/use-<thing>.ts`                  |
| **Feature hook**          | Composite hook tied to one feature's schema/types/services.                                                                                  | `src/features/<f>/hooks/use-<f>-<thing>.ts` |

Extract a composite hook when a component has ≥3 related hook calls working together, or the same combination appears in 2+ components. Details and examples in `references/hooks-patterns.md`.

## Key Patterns

### Primitive shared hook

```ts
// src/hooks/use-disclose.ts
import { useCallback, useMemo, useState } from 'react'

export const useDisclose = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const onOpen = useCallback(() => setIsOpen(true), [])
  const onClose = useCallback(() => setIsOpen(false), [])
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return useMemo(
    () => ({ isOpen, onOpen, onClose, onToggle }),
    [isOpen, onOpen, onClose, onToggle],
  )
}
```

### Server data via TanStack Query over a service function

```tsx
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/features/product/services/product-action'

export function ProductList() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  if (isLoading) return <LoadingSpinner />
  if (!data?.length) return <EmptyState />

  return (
    <ul>
      {data.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  )
}
```

### React 19 form with `useActionState` (client async action)

```tsx
import { useActionState } from 'react'
import { subscribe } from '@/features/newsletter/services/subscribe'

type FormState = { error?: string; success?: boolean }

const submit = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  try {
    await subscribe(String(formData.get('email')))
    return { success: true }
  } catch {
    return { error: 'Failed to subscribe' }
  }
}

export function NewsletterForm() {
  const [state, action, isPending] = useActionState(submit, {})

  return (
    <form action={action}>
      <input name="email" type="email" required disabled={isPending} />
      <button type="submit" disabled={isPending}>
        Subscribe
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  )
}
```

Forms with validation use react-hook-form + Zod through a feature hook instead (`useProductForm`).

## Constraints

### MUST DO

- TypeScript strict; typed props (`<Component>Props`) and typed hook options/returns
- Client components only; no Server Components, directives, or server actions
- Server data through TanStack Query over a service function; no axios/fetch in components
- One component per file; one hook per file, in the folder its kind dictates
- Error boundaries around routes / risky subtrees
- Stable, unique `key` props
- Clean up effects (return the cleanup)
- Semantic HTML and ARIA (see `fixing-accessibility`)
- Every shared hook and prop-driven component ships with its test
- Prettier style: no semicolons, single quotes, trailing commas, 80 cols

### MUST NOT DO

- Mutate state directly
- Use array index as key for dynamic lists
- Leave bulky multi-hook logic inline in a component when a composite or feature hook fits
- Put feature imports (schema, types, services) in a `src/hooks` hook
- Return JSX from a hook (except a hook whose job is rendering, e.g. a portal)
- Forget useEffect cleanup
- Ignore React strict mode warnings

## Output Templates

When implementing React features, provide:

1. Component file(s) with TypeScript types
2. Hook file(s) in the right folder when logic was extracted
3. Test file(s) following `vitest-conventions`
4. Brief explanation of key decisions

## Knowledge Reference

React 19 (client), use() hook, Suspense, TypeScript, TanStack Query, Zustand, react-hook-form + Zod, TanStack Router, React Testing Library, Vitest, accessibility (WCAG)
