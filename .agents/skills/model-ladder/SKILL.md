---
name: model-ladder
description: Use BEFORE executing implementation work that meets any of these countable thresholds — ≥2 files to change, OR ≥3 mechanical edits with a clear spec, OR any single edit over 30 lines of new code. Also use when a task needs brainstorming, architecture or design judgment before execution. Development-first ladder — the Sonnet main session is the thinker, verifier and top execution rung; execution goes to Haiku first and climbs to Sonnet inline only on a diagnosed capability gap. Opus is never an executor; it is consulted only for brainstorming/design and returns a plan. Skip only for a genuine single one-liner. Triggers — multi-file edits, batch refactors, "delegate to lowest model", "use the model ladder", "brainstorm with opus", "/model-ladder".
---

# Model Ladder — Sonnet brain, Haiku hands, Opus for ideas

Development work runs on **Sonnet** as the default session model. Sonnet thinks, writes briefs, verifies, and is the top execution rung. Execution drills **down** to Haiku whenever Haiku can do it. **Opus is not on the execution ladder**: it is a read-only advisor called for brainstorming and design, and it hands back a plan that Sonnet/Haiku execute.

Per-agent model override works: dispatching `subagent_type: tier-haiku` runs Haiku, `tier-opus` runs Opus (models pinned in `agents/tier-*.md` frontmatter). There is no native cheapest-capable router; this skill is that router.

## The ladder

| Rung       | Who                  | Model                         | Role                                                         |
| ---------- | -------------------- | ----------------------------- | ------------------------------------------------------------ |
| brain      | main session         | Sonnet (default)              | think, brief, verify every task; never delegated              |
| 0          | `tier-haiku`         | `claude-haiku-5-5`, effort high | **START HERE for every execution unit**                     |
| 1          | main inline          | Sonnet                        | top execution rung; Sonnet does it itself, no dispatch       |
| 1 (parallel) | `tier-sonnet`      | `claude-sonnet-5-5`, effort medium | only for fan-out: N independent Sonnet-level units at once |
| advisor    | `tier-opus`          | `claude-opus-5-5`, effort high | **brainstorm / design only**, read-only, returns a plan      |
| ceiling    | human                | —                             | when Sonnet inline fails after an Opus consult (or the user declines one) |

Why Sonnet inline instead of a `tier-sonnet` dispatch on a single-unit climb: dispatching Sonnet from a Sonnet main pays a context-transfer hop to reach the same brain. Use `tier-sonnet` only when several Sonnet-level units can run in parallel.

## When Opus is called (and only then)

Opus costs the most, so it is used for thinking that Sonnet can't do well, never for typing code.

Call `tier-opus` with `ROLE: brainstorm` when:

1. **The user asks** to brainstorm, explore options, or "ask Opus".
2. **Greenfield design**: new architecture, new library/module boundaries, data model, or a non-obvious trade-off with ≥2 viable designs, before any code is written.
3. **Design dead-end**: Sonnet inline failed a task and the diagnosis is "I don't know the right approach", not "I made a mistake". Opus proposes an approach; execution restarts at rung 0 with the new plan.

Never call Opus to: implement, edit files, run refactors, write tests, or review mechanical output. Executable checks (tests, counts, file state) are verified by Sonnet running them.

If the session itself is switched to Opus (user ran `/model opus` for a brainstorming session): Opus brainstorms inline and writes the plan to a file. Execution still goes down the ladder: dispatch `tier-haiku` first, `tier-sonnet` on a capability gap. Don't spend Opus on execution just because it's loaded. Suggest switching back to Sonnet once the plan is settled.

## Control loop

```
task ──► THINK (Sonnet): need design first? ──yes──► tier-opus ROLE: brainstorm ──► plan file
             │ no                                                                     │
             ▼                                                                        ▼
         write brief (criteria + artifact) ◄──────────────────────────────────────────┘
             ▼
         dispatch tier-haiku ──► VERIFY inline (Sonnet)
             │ PASS ─► record, done
             │ FAIL ─► DIAGNOSE
             │          bad brief   ─► fix brief, re-dispatch haiku
             │          transient   ─► retry haiku once
             │          capability  ─► Sonnet does it inline ──► verify
             │                                    │ FAIL: approach unknown ─► tier-opus brainstorm ─► new plan ─► rung 0
             │                                    │ FAIL: after Opus plan  ─► human
```

### Algorithm (follow exactly)

1. **THINK (Sonnet).** Decompose the task. If it needs a design decision (see "When Opus is called"), consult `tier-opus` first and save its plan to a file. Never delegated.
2. **Brief.** Write acceptance criteria + a report-file path into a brief file (scratchpad), following `BRIEF-TEMPLATE.md`. Criteria must be checkable: named tests/commands or concrete outputs.
3. **Dispatch rung 0** (`tier-haiku`, `ROLE: implement`) with the brief path and the exact `path:line-range`s already located. `attempt = 0`.
4. **VERIFY inline** (see verify()). PASS → record the winning tier, done.
5. **FAIL → DIAGNOSE** (don't climb blindly):
   - **Bad/ambiguous brief** (Haiku did what you asked; you asked wrong) → fix the brief, re-dispatch Haiku. No climb for your own spec error.
   - **Transient** (timeout, tool crash, truncation, rate limit) and `attempt < 1` → `attempt += 1`, re-dispatch Haiku.
   - **Capability gap** (wrong logic, BLOCKED, can't do it) → step 6.
6. **CLIMB to Sonnet inline.** Do the task yourself. Verify the same way.
7. **Sonnet fails:**
   - Approach unknown / design problem → consult `tier-opus` (`ROLE: brainstorm`) with the failure report; restart at step 2 with the new plan (Haiku first again if the plan makes it mechanical).
   - Already had an Opus plan, or the failure isn't a design problem → **escalate to the human** with the failure report.
8. Never skip rungs. Never re-dispatch the same tier on a capability gap; something must change (fix brief, climb, or consult).

Optional gut-check (opt-in): before step 3, if the unit is clearly beyond Haiku (cross-cutting judgment, subtle concurrency, unfamiliar codebase-wide reasoning), skip to Sonnet inline. Default stays Haiku-first.

## verify() — inline, layered

Run in the main session. First decisive result wins.

1. **Status gate.** `DONE` / `DONE_WITH_CONCERNS` proceed. `BLOCKED` → capability gap. `NEEDS_CONTEXT` → supply it, re-dispatch same tier (if it can't be supplied → human).
2. **Test/criteria gate.** Run the named tests/commands yourself. The subagent's pasted output is a claim, not evidence. Missing evidence or failing tests → capability gap.
3. **Judge inline.** No tests → read the report file (not the raw diff) and judge against the criteria. Don't dispatch a reviewer subagent.
4. **Missing report file ≠ fail by itself.** Re-run the key evidence; if it confirms the work → PASS with a concern. Exception: the file IS the deliverable → FAIL.
5. **Judgment claims** (docs vs implementation, unstated user intent, design soundness) stay with Sonnet; on a high-stakes design question Sonnet can't settle, consult `tier-opus` with `ROLE: review-design` (read-only verdict, not a code review).
6. **Classify** for DIAGNOSE: your spec wrong = bad brief; timeout/crash/truncation = transient; wrong output/BLOCKED = capability gap.

## Dispatch hygiene

- Requirements go in a **brief file**, not pasted prose. Reports go to a **report file**; the reply is only the status block.
- One dispatch = one task: brief path, interfaces it touches, your resolution of any ambiguity. No session history.
- Always set `subagent_type: tier-*` and do NOT pass the Agent tool's `model` parameter; it overrides the pinned model + effort. An untyped dispatch inherits the session model.
- Opus dispatches get the problem statement, constraints, relevant file paths and what was already tried. Ask for: 2-3 options with trade-offs, a recommendation, and a step plan Haiku/Sonnet can execute. Report to a file.
- Chunk Haiku inputs over ~100k tokens; fan out one `tier-haiku` per chunk and merge inline.
- **Artifact test:** a brief must demand something whose absence is visible (a command whose verbatim output must be pasted, or a file at a stated path). "Verify it works" fails the test.

## Fan-out (dispatch shape)

Tier choice and fan-out are orthogonal. Fan-out decides how many units go in one message; each unit still starts at its own cheapest rung.

- Multiple Agent calls in ONE message run in parallel; one per message is sequential.
- Measured: ~1.49x wall-clock, token-neutral; per-agent duration inflates ~1.8x under contention. Don't promise 2x.
- Parallel Sonnet-level units → `tier-sonnet` dispatches (the only use of `tier-sonnet` from a Sonnet main).
- Don't fan out with shared files/state, ordered steps (implement → verify), or speculative splits.
- Collapse N outcomes into ONE verdict line for the user.

## Recording outcomes

Append one line per delegated task to `.model-ladder/log.md` (or the scratchpad):
`Task <name>: SUCCESS at <haiku|sonnet-inline|tier-sonnet> (attempts: haiku=N, sonnet=M, opus-consults=K)` or `Task <name>: ESCALATED TO HUMAN — <reason>`.
This is the recovery map after compaction and the evidence of where cost went.

## Honest limitations

- Each Haiku dispatch is a subagent hop; on trivial work the overhead exceeds the savings. Bypass the ladder there.
- Haiku-first wastes one cycle on units Haiku can never do. Accepted trade-off; use the opt-in gut-check when it's obvious.
- Sonnet verifies its own briefs, so it shares their blind spots. Opus is reserved for design, so subtle judgment errors in verification are a known gap; consult Opus (`review-design`) when the stakes justify it.
- Verification leaves per-task bytes in the main context. Keep verification test-based and read status blocks, not diffs.
