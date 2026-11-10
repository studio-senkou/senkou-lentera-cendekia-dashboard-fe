# Brief template for lowest-capable models (Haiku tier)

Distilled from measured dispatches, not intuition. Evidence base: 4 Haiku dispatches
in one session on a real repo (2026-09-11) — 4/4 correct execution, 0 capability
failures, 0 rung climbs, ~17-34k subagent tokens each. Every observed defect was a
REPORTING defect caught by a demanded artifact; none was an execution defect.

## The finding that should change how you write briefs

**The weak link was the brief, not the model.** 2 of 3 briefs contained an
orchestrator error:

- A brief with guessed line counts ("expect 33 write_env lines"; the real answer was
  59) — caught only because the counts were baselined BEFORE dispatch.
- A brief that asked for a list but no self-consistency check — the subagent's prose
  said "27 vars" while its own table correctly listed 33. The wrong number reached
  the user.

Haiku executed faithfully both times. It cannot rescue you from a wrong spec — it
will implement your error precisely. The leverage is in the brief, not the rung.

## Rules, in order of measured payoff

### 1. Never put a number in a brief you have not measured

Any count, line number, or "expect N" is a landmine. Measure first, paste the real
value, and label it as a baseline that must not move.

```bash
# run BEFORE writing the brief; paste real output into it
grep -c 'write_env ' config/startup.sh   # -> 59
sha256sum target_file | cut -c1-16       # -> invariant to re-check after
```

Wrong: `expect same as before: 33`
Right: `expect EXACTLY 59 (pre-edit baseline — must not move)`

### 2. Demand an artifact whose ABSENCE is visible

Not "confirm it works". A named command whose verbatim output must be pasted, or a
file at a stated path. This is what caught both defects.

The strongest form is a **command that must print nothing**:

```bash
echo "=== C: expect NO output ==="
diff <(grep -i telescope .env) <(grep -i telescope .env.example)
```

An empty result is unforgeable and needs no interpretation. Prefer it over any
"is it correct?" question.

### 3. Prefer a behaviour test over an inspection test

Inspection proves shape; execution proves behaviour. For anything runnable, require
BOTH the positive and the negative case, each with real output:

```bash
# G: the thing that must be preserved
printf 'CUSTOM_VAR=keepme\n' > $SB/.env && cp $SB/.env $SB/.env.orig
bash $SB/part.sh
diff -q $SB/.env $SB/.env.orig && echo "PRESERVED" || echo "GUARD FAILED"

# H: the thing that must still happen
rm -f $SB/.env && bash $SB/part.sh
[ -f $SB/.env ] && echo "CREATED" || echo "GENERATION BROKEN"
```

Test H exists because a guard that blocks everything also passes test G. **Every
guard needs its negative control** — otherwise "it didn't break anything" and "it
does nothing" are indistinguishable.

### 4. Add a self-consistency check when output has a count or a total

The "27 vs 33" slip was cheap to prevent. One line in the brief:

> Your table's row count MUST equal the number you state in prose. Before writing the
> report, count the rows and use that number. If they disagree, the table wins.

### 5. Quote the exact before/after text; forbid retyping

For edits to large blocks, name the invariant explicitly:

> Keep all 59 `write_env` lines byte-identical and in their current order — do not
> retype, reorder, or re-indent them. Minimal diff is the goal.

Re-indentation is the most common unrequested change. Saying "prefer the minimal
diff; bash does not care about indentation inside `{ }`" produced a 16-line diff
instead of a 60-line one.

### 6. State the blast radius and the STOP condition

Weak models do not infer danger. Spell it out:

> This file contains real secrets (APP_KEY, DB_PASSWORD). Do not change, regenerate,
> or print any secret value.
> If `PRIVATE_AWS_BUCKET_ROOT=` is absent, STOP and report NEEDS_CONTEXT with what
> you actually found — do not guess a different insertion point.

An explicit STOP beats a confident wrong guess. Pair it with an invariant the
orchestrator re-checks afterwards:
`grep -E '^(APP_KEY|DB_PASSWORD)=' .env | sha256sum` — same hash before and after.

### 7. Keep the report OUT of the reply

Bytes in the reply defeat the point of delegating.

> Return ONLY:
> STATUS: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
> REPORT: <path>
> ONELINE: <one sentence>
> Do NOT paste file contents or the report body into your reply.

Observed: 3 of 4 subagents violated the reply contract — one pasted its whole
summary, one pasted a section-by-section report, and one returned
`REPORT: All acceptance criteria met` instead of a path, having never written the
report file at all (its work was correct; only the reporting failed). Restate the
contract at the END of the dispatch prompt, not only in the brief file — the last
instruction wins.

**Corollary — the report file is not self-enforcing.** A brief can name the exact
path twice and still produce no file. So never treat the report as the deliverable:
the ARTIFACT COMMANDS are. Re-run them yourself (orchestrator rule 2). If a missing
report would actually block you, make the file an acceptance criterion you verify
with `ls -l <path>` rather than a trusted side effect.

### 8. Give exact paths; never make it search

If retrieval already located the files, hand over `path:line-range`. Making the
subagent re-grep re-pays a cost you already paid, once per dispatch.

## Skeleton

```markdown
# BRIEF: <one-line goal>

ROLE: implement
lazy-senior: smallest correct change. Touch ONLY what is named below.

## File(s)
<absolute paths, with line ranges if known>

## Baseline (MEASURED, must not move)
<real command outputs: counts, hashes>

## The problem
<what is wrong, quoting the exact current text>

## Required change — exactly N edits
### Edit 1
<exact before text> -> <exact after text>
### Edit 2 ...

## Do NOT change
<explicit list: values, other sections, file mode>

## STOP conditions
If <precondition> is not true, report NEEDS_CONTEXT with what you found.
Do not guess.

## Acceptance criteria
1..N, each checkable by a command.

## CHECKABLE ARTIFACT (mandatory)
<commands to run; include at least one that must print NOTHING,
 and for runnable code both a positive and a negative behaviour test>
Write report to EXACTLY: <path>
Report sections: ## COMMANDS (verbatim) / ## EDITS MADE / ## NOTES

Return ONLY the status block. Do NOT paste contents into your reply.
```

## Orchestrator-side (non-negotiable, per g5)

1. **Baseline before dispatch.** Counts, hashes, and a backup of anything mutable.
2. **Re-run the artifact commands yourself.** The subagent's pasted output is a
   claim, not evidence. Both defects this session surfaced this way.
3. **When your own check fails, suspect your check first.** One "failure" this
   session was a grep pattern of mine that missed a newly added `&&` clause — the
   code was correct. Read the region before declaring a regression.
4. **Diff against the backup**, not just the target state: that proves nothing ELSE
   moved.

## Honest limits

- n=4, one repo, one session, all read-or-small-edit tasks (search, a config
  restructure, a shell-script guard, a file copy). Haiku going 4/4 on execution is
  NOT evidence it handles architecture or multi-file refactors — untested here.
- Both defects were in the reporting layer, so this template is tuned for report
  fidelity. A brief this strict may still not prevent a genuine capability failure;
  that is what the ladder's climb step is for.
- Naive control not run: it was not tested whether a SHORT brief (goal + one artifact
  command) would score the same on these tasks. Plausible for the two simpler ones.
  So per-rule payoff is unproven — only rules 1 and 2 have direct evidence, each
  having caught a real defect.
