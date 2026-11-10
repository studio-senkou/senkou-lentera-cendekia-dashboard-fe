# Components

## One component per file

- A `.tsx` file exports exactly one component, named after the file: `product-card.tsx` → `ProductCard`.
- Small private sub-components that only serve that component may stay in the same file, unexported, below or above the main one (e.g. a row, a label pair, a stamp). Once a sub-component is reused elsewhere, has its own state, or grows past ~30 lines, move it to its own file.
- Skeletons get their own file: `product-card-skeleton.tsx`.
- Big documents split by section: `report-pdf/{report-document,header,items,summary}.tsx` + `styles.ts`.
- Exceptions: `src/components/ui/*` (shadcn) export families (`Card`, `CardHeader`, …). Do not edit them; compose around them.

## Separation of concerns

| Concern                         | Lives in                                   |
| ------------------------------- | ------------------------------------------ |
| Markup + styling                | component `.tsx`                           |
| Local state, effects, form wiring | `hooks/use-<thing>.ts`                    |
| Server data                     | React Query hook wrapping a service fn     |
| HTTP                            | `services/*.ts` (plain async fn)           |
| Validation                      | `schema/*.ts` (Zod via `createSchemaFactory`) |
| Formatting / pure logic         | `utils/*.ts`                               |
| Reusable stateful logic         | a class in `src/lib/` or `utils/*-builder/` |
| Static config (columns, options)| `constants/*.ts(x)`                        |
| Copy                            | `i18n/{en,id}.json` via typed `Translations.useT()` |

Component smells to split on: >300 lines, >10 props, mixes fetching + rendering + mutation logic, inline IIFEs computing values (move to a util), more than one `useEffect` chain doing different jobs (move to a hook).

## Shape

```tsx
import type { Product } from '@/features/product/types'
import { Translations as ProductTranslations } from '@/features/product/i18n'
import { formatCurrency } from '@/utils/number'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ProductCardProps = {
  product: Product
  isSaving: boolean
  onArchive: (product: Product) => void
}

export function ProductCard({ product, isSaving, onArchive }: ProductCardProps) {
  const t = ProductTranslations.useT()
  // derive, then render; no fetching here
}
```

- Props type named `<Component>Props`, declared above the component, not exported unless reused.
- Prop-driven presentational components (cards, badges, summaries) are the testable unit; keep router/React Query out of them so they render in a plain test.
- Callbacks passed in (`onArchive`, `onConfirm`), not performed inside.
- Expose stable `data-testid` hooks only where role/name queries cannot reach (`confirmTestId`).
- Heavy components (pdf, maps, editors) loaded with `await import()` / lazy routes.

## Hooks

- `use-<thing>.ts` in `src/hooks` (generic) or `features/<f>/hooks` (feature).
- A hook returns an object or tuple; it never returns JSX (`.tsx` hooks only when they must render, e.g. a printer portal).
- Wrap class instances from libs with `useSyncExternalStore` or a ref; do not re-create instances per render.
