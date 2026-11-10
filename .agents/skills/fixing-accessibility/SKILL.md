---
name: fixing-accessibility
description: Use whenever asked to audit, review, or fix accessibility (a11y) issues in a React app — icon-only buttons, missing labels, keyboard navigation, focus management, screen reader support, WCAG compliance, or any request to "make this accessible" / "check a11y" / "add aria labels". Also use proactively when reviewing or writing custom interactive widgets (dropdowns, lists, tabs) that don't use an existing Radix/shadcn (or similar headless) primitive. Targets WCAG 2.1 AA using the project's existing primitives rather than hand-rolled ARIA.
---

# Fixing Accessibility

Headless primitive libraries (Radix via shadcn, React Aria, Headless UI) already solve most hard a11y problems: focus trapping, keyboard navigation, roving tabindex. Most real a11y bugs come from either (a) not using those primitives, or (b) using them but skipping the one manual attribute the library can't infer (an `aria-label`, an `aria-sort`). Fix the specific gap; don't re-architect the widget.

## Audit checklist

Work through these in order. Each is a common gap pattern; check for it specifically rather than doing a generic scan.

### 1. Icon-only buttons have no accessible name

Typical bug: `<Button size="icon">` wrapping only an icon, wrapped in `<Tooltip>` for visual labeling. **A visual tooltip is not an accessible name.** Radix `Tooltip` wires `aria-describedby`, not `aria-label`, so the button's name is empty to screen readers. Table action columns (edit/delete/view icons) are the usual hotspot.

Fix: add `aria-label` directly to the button, describing the action ("Edit item", "Delete row"), in addition to (not instead of) the visual tooltip.

```tsx
<Button size="icon" variant="destructive" aria-label={t('actions.delete')}>
  <XCircleIcon className="w-2 h-2" />
</Button>
```

Also check for icon-only buttons with `tabIndex={-1}` (e.g. a password show/hide toggle). That removes the control from the tab order, making it keyboard-unreachable. Remove the negative tabIndex unless the control must never receive focus.

### 2. Form fields missing a real `<Label htmlFor>`

Shared form field components usually wire `Label htmlFor` to the input `id` already; forms built on them are fine. The bug appears when a field is built by hand: a raw `Input`/`Select` with a `<span>` or `<div>` styled to look like a label. Check any form markup that bypasses the shared field components.

### 3. Decorative icons double-announced

An icon next to visible text that already says the same thing should be `aria-hidden="true"`. Low severity, easy fix. Don't add it to icon-only buttons; those need a name via `aria-label` on the button (see #1).

### 4. Status conveyed by color alone

Status badges should always carry text, not just color. A new indicator (colored dot, border, or icon without text) needs visible text or an `aria-label` / `sr-only` equivalent.

### 5. Custom widgets reinventing what the primitives provide

Before writing a custom list/dropdown/menu with manual `tabIndex`/`onKeyDown` state, check whether the primitive library's `dropdown-menu`, `select`, `tabs` or `command` covers it; those ship correct keyboard nav and ARIA roles. If a custom widget is genuinely required, it needs the ARIA the primitive would have provided:

- `role="listbox"` on the container, `role="option"` + `aria-selected` on each item (or the matching roles for the actual pattern: menu, tree, grid, …)
- `aria-activedescendant` on the focused container pointing at the current item's id, if focus stays on the container
- Don't reuse a business-domain prop named `role` as the ARIA `role` attribute; they're unrelated, and a component can need both.

A single `div role="button" tabIndex={0}` with an Enter/Space `onKeyDown` is fine. The gap is multi-item widgets that need composite roles.

### 6. Dialogs, sheets, drawers

Focus trap and focus return on close are handled by the primitive. Don't add manual `.focus()` calls or `onOpenAutoFocus`/`onCloseAutoFocus` overrides unless there's a documented reason (e.g. a specific field must get focus on open). Existing custom focus code in an overlay is a smell: it's likely fighting the primitive's defaults.

### 7. Sortable table headers missing sort state

Sortable headers often have an `aria-label` describing the sort action but no `aria-sort` on the header cell. When touching one, add `aria-sort` (`"ascending" | "descending" | "none"`) on the `<th>` from the column's current sort state, so screen reader users get state, not just the action.

## Workflow

1. Scope the audit to what was asked: a component, a page, or the whole repo. For a broad ask, grep for the patterns above (`size="icon"` buttons, hand-built form markup outside the shared fields, custom `tabIndex`/`onKeyDown` widgets) rather than opening every file.
2. Fix in place by using the existing primitive correctly (add the missing attribute) rather than replacing it or adding a dependency. See [[baseline-ui]] for which shared component to use if a fix means swapping hand-rolled markup.
3. Prefer visible/semantic fixes (a real `<label>`, real button text) over ARIA patches. ARIA is the fallback when the visual design can't carry the information (e.g. icon-only buttons).
4. Any new user-facing text (an `aria-label`, a visible label) goes through the project's i18n system if it has one. Don't hardcode strings in JSX.
