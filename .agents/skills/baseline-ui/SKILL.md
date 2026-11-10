---
name: baseline-ui
description: Use whenever building or modifying UI/markup in a React app — laying out a new page, form, drawer, dialog, table, card, or any visual structure. Enforces the project's established UI composition (page shell, shared layout/data-display components, primitive library such as shadcn/ui, spacing conventions) instead of hand-rolling new markup. Trigger even if the user just says "add a page for X" or "build a form UI for Y" without mentioning components explicitly. Purely about visual structure/composition — not data fetching, state management, or form submission logic.
---

# Baseline UI

A mature app has a settled visual shape for every kind of screen. New UI is composed from the same page shell, layout, and shared components as the rest of the app, not new markup from scratch.

## Step 0: map the project's building blocks

Before writing markup, find what already exists. Typical homes (adjust to the project):

| Building block       | Look in                                                        |
| -------------------- | -------------------------------------------------------------- |
| Page shell           | `src/components/layout/` (e.g. `page/`, `base-layout.tsx`)      |
| App chrome           | `src/components/layout/{top-bar,sidebar,footer}/`              |
| Tables + pagination  | `src/components/ui/table*`, `src/components/data-display/tables/` |
| Form fields          | `src/components/forms/fields/`, `src/components/forms/inputs/`  |
| Filter bars          | `src/components/forms/filters/`                                 |
| Drawers / dialogs    | `src/components/overlays/`                                      |
| Empty/loading/error  | `src/components/common/{empty-state,loading,error-state}/`      |
| Charts               | `src/components/data-display/charts/`                           |
| Primitives           | `src/components/ui/` (shadcn/Radix or equivalent)               |

Then pick the closest existing feature screen (a simple list page, a richer detail page) and mirror its structure and spacing.

## Page shell

Every route wraps its content in the project's page layout component (title, subtitle, card container). Don't build a page header or card wrapper by hand.

App chrome (top bar, sidebar, footer) is fixed. Never touch it for a feature page.

## Tables

- Render with the shared table component (`<Table columns={...} data={...} loading={...} />`), not a hand-built `<table>`.
- Use the shared pagination and search components for list pages.
- Declare columns as an array of column definitions in a feature-level factory (e.g. `features/<feature>/constants/column.tsx`), not inlined as JSX in the page.
- Row-number columns derive from pagination; date columns use the project's date formatter; action columns wrap their buttons in the project's permission guard so gated actions don't render for users without access.

## Forms: field components, not logic

- Use the shared field components (text, select, number, checkbox, radio, multi-select, textarea, …) for inputs. Lower-level pickers (date, time, file upload) live next to them.
- Filter bars are a different system from data-entry forms: if the project has schema-driven filter components, use them. Don't reuse data-entry fields for a filter bar, and don't build filter inputs from raw primitives.

## Drawers, dialogs, overlays

Create/edit panels go in the project's drawer wrapper. Check the overlays folder for dialog/sheet/popover wrappers before reaching for the raw primitive.

## Data display and feedback states

- No data: the shared empty-state component (icon + title/description + optional actions, translated default text). Never a bare "No data" string.
- Loading: the shared spinner/wrapper. Don't write a new spinner.
- Error: the shared error-state component.
- Tooltips: the shared tooltip wrapper, used around icon-only action buttons.
- Tabs and charts: the shared wrappers, not a raw charting library call.
- Feature-local panels (e.g. a detail sidebar) may be new per feature, but follow the layout and spacing of an existing one.

## Primitives (`src/components/ui/`)

Base building blocks (`button`, `card`, `input`, `select`, `badge`, `dialog`, `table`, …) that the shared components are built from. Compose around them for anything a shared component doesn't cover. If they are generated (shadcn), never hand-edit them to restyle; wrap or extend from outside.

## Quick checklist for new UI

1. Map the building blocks (Step 0) and pick a reference screen to mirror.
2. Page → page layout component. Table → shared table + pagination + column-def factory. Search → shared search.
3. Form fields → shared fields; filter bars → shared filter system (don't mix).
4. Create/edit UI → shared drawer; check overlays before using a raw dialog/sheet.
5. Empty/loading/error → shared state components, not bespoke markup.
6. Gate visible actions/columns with the project's permission guard.
7. Never edit generated primitives directly.
