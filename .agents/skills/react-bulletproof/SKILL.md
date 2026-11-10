---
name: react-bulletproof
description: Use PROACTIVELY when structuring, maintaining, reviewing or auditing the architecture of a React + TypeScript codebase — directory layout, feature modules, file naming, where code belongs, component separation of concerns, shared utilities, custom library folder structure, lint/format standards, and migration planning. Triggers on "bulletproof react", "where should this go", "organize React app", "split this component", "audit my architecture".
---

# React Bulletproof Maintenance

Architecture guide and auditor for React 19 / TypeScript (strict) / Vite apps: how the code is laid out and structured. Reference stack: TanStack Router + Query, Zustand, react-hook-form + Zod, shadcn/ui, Vitest, oxlint, prettier. The rules are stack-neutral; swap each library for your project's equivalent.

Related skills, load them for their topic:

- `typescript-oop` — how to write classes, method naming, advanced TypeScript
- `vitest-conventions` — how to write tests
- `playwright-codemode` — driving a browser through the Playwright MCP

Read only the reference file for the task at hand.

| Task                                    | Read                           |
| --------------------------------------- | ------------------------------ |
| Folder layout, feature modules, imports | `reference/structure.md`       |
| Custom library folder layout            | `reference/custom-library.md`  |
| Writing or splitting components         | `reference/components.md`      |
| Lint / format setup or review           | `reference/tooling.md`         |
| Auditing a codebase                     | `reference/audit_criteria.md`  |
| Prioritising findings                   | `reference/severity_matrix.md` |

## Non-negotiable rules

1. **Feature-based.** Domain code lives in `src/features/<feature>/{components,services,schema,hooks,i18n,types,utils,test}`. Shared code lives in `src/{components,hooks,lib,stores,services,utils,types,constants}`. Cross-module imports go through `@/`, never `../../`.
2. **Right home.** Used by one feature: feature folder. Used by 2+: shared folder. Reusable stateful logic: a class in `src/lib/<lib>/` or `src/utils/<name>-builder/`. Pure helper: `utils/`.
3. **kebab-case file names.** Hooks `use-<thing>.ts`, stores `use-<thing>-store.ts`, components named after the file (`product-card.tsx` → `ProductCard`), one class per file named after the class.
4. **One component per file.** A `.tsx` exports one component. Small private sub-components used only by that component may stay in the file, unexported. Anything reused, stateful or longer than ~30 lines gets its own file.
5. **Separation of concerns.** Component renders. Hook holds state and effects. Service does IO. Schema validates. Class encapsulates reusable logic. No axios in components; no JSX in services.
6. **Types grouped.** Feature types in `types/index.ts` + `types/dto.d.ts`; library types in `<lib>.types.ts` or `<lib-specific>.d.ts`.
7. **Libraries have one entry.** `src/lib/<lib>/index.ts` re-exports the public surface; React adapters live under `react/`.
8. **Never hand-edit** generated files (route tree, i18n registry) or shadcn `src/components/ui/*`.
9. **Lint + format clean.** oxlint (`correctness: error`, plugins react/typescript/unicorn/import) and prettier (`semi: false`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 80`). Templates in `templates/`.

## Workflow when adding code

1. Reuse first: search `src/hooks`, `src/utils`, `src/lib` before adding anything.
2. Pick the home (rule 2) and the file name (rule 3).
3. Split by concern (rule 5) before the file grows.
4. Run `npm run check` (prettier + oxlint --fix), `npm run test`, `npm run build`.

## Audit

```bash
python3 scripts/audit_engine.py /path/to/app --output report.md
python3 scripts/audit_engine.py /path/to/app --format json --output report.json
python3 scripts/audit_engine.py /path/to/app --migration-plan --output migration.md
```

Categories: structure, components, state, api, testing, styling, errors, performance, security, standards, conventions (class-per-file, method names, component-per-file, types placement, test naming/placement, missing tests). Static regex heuristics: verify a finding before acting on it.

| Priority    | Examples                               | Timeline     |
| ----------- | -------------------------------------- | ------------ |
| P0 Critical | Security vulns, breaking issues        | Immediate    |
| P1 High     | Feature folder creation, reorg         | This sprint  |
| P2 Medium   | State refactor, API layer, split files | Next quarter |
| P3 Low      | Naming, docs, polish                   | Backlog      |

Migrate incrementally: folders first, then feature extraction, then component splits. Keep tests green at every step.

## Resources

- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- `examples/sample_audit_report.md`
