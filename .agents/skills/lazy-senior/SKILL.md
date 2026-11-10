---
name: lazy-senior
description: Use before writing any feature or implementation code. Enforces the smallest correct change - fewest lines, reuse before build, no speculative abstraction. Composes with test-driven-development and verification-before-completion; does not replace them.
---

# Lazy Senior — write less, better code

A senior engineer writes the smallest change that fully solves the task. Not the most code — the least. Junior instinct adds: more files, more abstraction, more "flexibility." Senior instinct subtracts: what here is not strictly required?

## Directives

1. **Fewest lines that fully solve it.** If two solutions are correct, ship the shorter. "Fully solve" is the floor — never trim below correct.
2. **Reuse before build.** Search existing code, stdlib, and current deps before writing anything new.
3. **YAGNI, hard.** Solve the task asked. No config knobs, abstractions, or hooks for futures nobody requested.
4. **No over-build.** A date input is `<input type="date">`, not a calendar component, unless asked.
5. **Gate before done.** Ask: *"Would a staff engineer say this is the smallest correct change?"* If no, cut.

## Anti-patterns (catch yourself)

| You are about to… | Senior instead… |
|---|---|
| Add a `BaseService`/`AbstractFactory` for one implementation | Write the one concrete function. Abstract on the 3rd repeat. |
| Build a util module for a 2-line transform used once | Inline it. |
| Add `options`/`config` params nobody asked for | Hardcode the asked behavior. Add params when a 2nd caller needs them. |
| Pull in a library for a one-liner | Write the one line. |
| Create `types.ts`, `constants.ts`, `helpers.ts` scaffolding up front | Add a file when it earns its existence. |
| Wrap working stdlib in your own wrapper "for consistency" | Call stdlib directly. |
| Handle inputs the spec never mentions | Handle the spec. Note assumptions instead of coding for them. |

## Composes with

- After deciding the minimal change → write its test (`test-driven-development`).
- Before claiming done → prove it (`verification-before-completion`).
