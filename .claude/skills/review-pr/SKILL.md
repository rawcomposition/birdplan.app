---
name: review-pr
description: Senior code review for BirdPlan. Analyzes changes on the current branch (or a PR number) for correctness, security, auth/ownership, performance, UX robustness, and BirdPlan convention compliance.
user-invocable: true
allowed-tools: Read, Grep, Glob, Agent, Workflow, Bash(gh *), Bash(git *), Bash(npm *), Bash(npx *)
---

# review-pr — Senior Code Review

Review changes as a senior engineer who knows the BirdPlan codebase. Use this skill to catch issues before they reach production.

## Arguments

The user may optionally pass a PR number (e.g., `/review-pr 1234` or `/review-pr #1234`). If no argument is provided, review the current branch against `main`.

## Process

> **Thinking mode:** Use `ultrathink` — extended thinking produces significantly better analysis of complex code changes.

### 1. Gather the diff (pre-loaded)

> **Note:** If a PR number was provided via arguments, ignore the pre-loaded context below and fetch that PR's data with `gh pr diff <number>` and `gh pr view <number> --json headRefName` instead.

**Branch diff:**

!`gh pr diff 2>/dev/null || git diff main...HEAD`

**Branch info:**

!`git branch --show-current`

**Recent commits:**

!`git log main...HEAD --oneline 2>/dev/null`

If the diff above is empty, try `git diff HEAD` (uncommitted) then `git diff` (unstaged). If still empty, report **"No changes found."** and exit.

**Changed file names:**

!`gh pr diff --name-only 2>/dev/null || git diff main...HEAD --name-only`

**After reviewing the diff**, categorize the changed files: shared (`shared/**/*.ts`), backend (`backend/**/*.ts`), frontend (`frontend/**/*.{ts,tsx}`), scripts (`scripts/**/*.ts`). For each changed file, **read the full source** (not just the diff hunk) for context.

### 2. BirdPlan review anchors

`CLAUDE.md` holds the full conventions; the per-dimension guidance below inlines what each reviewer needs. The non-obvious anchors to keep front of mind:

- **No auth middleware** — every protected handler explicitly calls `authenticate(c)` (or `authenticateOptional(c)` for public-readable routes) from `lib/utils.js`. A missing call = unauthenticated access. Ownership is gated by roster/editor helpers (`isTripEditor`, `isEditorInRoster`, `loadActiveRoster`, `canEdit`/`isOwner`) — never trust client-sent identity or ownership.
- **No test suite** — `npm run typecheck` (builds backend + frontend, typechecks scripts + shared) is the primary correctness gate.
- **Shared types** — `shared/types.ts` is the single source of truth for both sides; any change flows to both and can break persisted Mongo data and the offline React Query cache (`QUERY_CACHE_BUSTER`).
- **React style** (strong rule) — prefer derivation, lazy init, and custom hooks over `useEffect`/`useMemo`. **No code comments** unless they document a genuine upstream-bug hack, non-obvious regex, or undocumented workaround.

### 3. Run the review (workflow)

Fan the review out across BirdPlan's review **dimensions** in parallel, then adversarially verify every finding before reporting it. This is a valid `Workflow` opt-in: these skill instructions explicitly direct you to call the `Workflow` tool.

**Fallback — review inline yourself** (read the diff, apply the priority order below, then go to section 4) when either the diff is **trivial** (only `*.md`, `*.css`, or config changed) or the `Workflow` tool is unavailable (headless/cron).

Otherwise build the `args` object from sections 1–2:

- `branch` — current branch (or the PR's head ref)
- `base` — `main`
- `prNumber` — the PR number if one was passed, else `null`
- `changedFiles` — the changed-file list (string array)
- `hasShared` / `hasBackend` / `hasFrontend` / `hasScripts` — whether any file in each area changed

Then call `Workflow` with the script below. Each dimension agent gets BirdPlan's conventions inlined, reads the changed files, and returns findings against a schema; every finding is then handed to a skeptic that tries to refute it. When the workflow returns, use `result.confirmed` for section 4. If the workflow errors or returns nothing usable, fall back to the inline review.

```javascript
export const meta = {
  name: "review-pr-review",
  description: "Senior BirdPlan code review fanned out by dimension and adversarially verified",
  phases: [
    { title: "Review", detail: "one agent per review dimension" },
    { title: "Verify", detail: "adversarially refute each finding" },
  ],
};

const ctx = args;

const FINDINGS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["findings"],
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["severity", "file", "title", "detail"],
        properties: {
          severity: { type: "string", enum: ["critical", "warning", "info"] },
          file: { type: "string" },
          line: { type: ["integer", "null"] },
          title: { type: "string" },
          detail: { type: "string" },
          suggested_fix: { type: "string" },
        },
      },
    },
  },
};

const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["refuted", "reasoning"],
  properties: {
    refuted: { type: "boolean" },
    reasoning: { type: "string" },
  },
};

// Dimensions map to BirdPlan's prioritized review areas. Each runs only when its
// relevant files changed. `guidance` is the inlined convention set the agent applies.
const DIMENSIONS = [
  {
    key: "auth-ownership",
    when: ctx.hasBackend,
    guidance:
      "There is NO auth middleware — every protected handler must explicitly call authenticate(c) (or authenticateOptional(c) for public-readable routes) from lib/utils.js; a missing call means unauthenticated access. Mutations must verify the caller may edit: trips use the roster/editor helpers (isTripEditor, isEditorInRoster, loadActiveRoster) and canEdit/isOwner — never trust client-sent ownership. Reading or writing another user's Trip/Profile/Participant by id without scoping to session.uid is an IDOR. Distinguish 401 (unauthenticated) vs 403 (forbidden) vs 404, and don't leak the existence of private resources.",
  },
  {
    key: "security",
    when: ctx.hasBackend,
    guidance:
      "The Firebase ID token is the only trust anchor — never accept uid/email/ownership from the request body. Guard against NoSQL/operator injection: never pass untrusted objects straight into Mongoose filters or $where; cast ids and values to expected primitives. No mass-assignment: don't spread `await c.req.json()` directly into updateOne/findByIdAndUpdate — whitelist fields against the shared *Input type. No secrets, tokens, or API keys in responses or logs; sensitive fields (e.g. shareCode/shareCodeCreatedAt) must be stripped before serializing a trip (see the existing destructure-and-omit pattern).",
  },
  {
    key: "race-data-integrity",
    when: ctx.hasBackend,
    guidance:
      "Avoid check-then-act against the DB; prefer atomic Mongoose operators ($set, $addToSet, $pull, findOneAndUpdate) over read-modify-write. Concurrent roster/lifelist edits and participant joins can race — operations should be idempotent and must not double-apply. Ensure parallel Promise.all writes don't depend on each other's side effects.",
  },
  {
    key: "api-patterns",
    when: ctx.hasBackend,
    guidance:
      "Call connect() (idempotent) before any DB access in a handler. Throw HTTPException(status, { message }) for errors — the global onError serializes them; don't hand-roll error c.json responses. Backend imports must use .js extensions (NodeNext ESM) and the lib/*, models/*, routes/*, shared/* path aliases — flag missing extensions or deep relative paths. Routes nest as Hono sub-apps mounted under /v1/*; keep response shapes consistent with the shared types. Models are typed against @birdplan/shared via Record<keyof ...> — schema and type must stay in sync.",
  },
  {
    key: "shared-types",
    when: ctx.hasShared,
    guidance:
      "shared/types.ts is the single source of truth imported by BOTH frontend and backend; any change flows to both, so verify both sides still compile (npm run typecheck). Removing, renaming, or narrowing a field is backwards-incompatible for persisted Mongo data AND the offline React Query cache (note QUERY_CACHE_BUSTER) — call it out. Prefer additive changes to API response shapes.",
  },
  {
    key: "performance",
    when: ctx.hasBackend,
    guidance:
      "Watch for N+1 Mongo queries — batch with $in / aggregation or bulk loaders (e.g. loadProfilesByUid) instead of per-item finds in a loop. Use .lean() for read-only queries; don't hydrate full Mongoose docs you won't mutate. Flag unbounded find() without limits, missing indexes on filtered fields, and over-fetching whole documents where a projection would do. Parallelize independent awaits with Promise.all.",
  },
  {
    key: "frontend",
    when: ctx.hasFrontend,
    guidance:
      "Data fetching is React Query keyed by URL: useQuery({ queryKey: ['/trips/123'] }) auto-GETs NEXT_PUBLIC_API_URL + key via the global queryFn — keep keys URL-shaped. Trip mutations should use useTripMutation with an updateCache(old, input) reducer for optimistic updates + rollback; general mutations use useMutation — flag manual setQueryData that bypasses these. STRONG project rule: prefer derivation, lazy initialization, and custom hooks over useEffect/useMemo — flag new useEffect/useMemo that could be derived state or a custom hook. Respect the provider stack and providers/trip.tsx state (selected species, canEdit/isOwner); don't duplicate trip state locally. Error UX: surface actionable errors inline where the user can fix them, not just a toast. The React Query cache is persisted to IndexedDB — shape-breaking changes need a QUERY_CACHE_BUSTER bump. NO code comments.",
  },
  {
    key: "correctness-types",
    when: ctx.hasBackend || ctx.hasFrontend || ctx.hasShared || ctx.hasScripts,
    guidance:
      "There is NO test suite — npm run typecheck (builds backend + frontend, typechecks scripts + shared) is the primary correctness gate; flag changes likely to break it. Avoid `any` and unchecked casts that defeat the shared types; prefer precise types. Handle null/undefined from Mongo (findById can return null) and optional fields before use. Enforce the no-comments rule: flag added explanatory comments that aren't genuine upstream-bug/regex/workaround notes.",
  },
].filter((d) => d.when);

// A diff that touches none of the categorized areas (skills, docs, CI) filters
// every gated dimension to nothing — guarantee at least one general reviewer.
if (DIMENSIONS.length === 0) {
  DIMENSIONS.push({
    key: "general",
    when: true,
    guidance:
      "General senior review: correctness, security, error handling, and clarity. Apply BirdPlan conventions where relevant (no code comments; self-explanatory code).",
  });
}

const diffCmd = ctx.prNumber ? `gh pr diff ${ctx.prNumber}` : `git diff ${ctx.base}...HEAD`;

// Adversarial skeptic: one verifier per finding. Default to refuted on uncertainty
// so only real problems survive.
const verify = (f) =>
  agent(
    `Adversarially verify this code-review finding. Your job is to REFUTE it — read the actual file and surrounding code, and decide whether it is a real, in-scope problem. Default to refuted=true if you are uncertain or it is merely stylistic noise.\n` +
      `File: ${f.file}${f.line ? ":" + f.line : ""}\nSeverity: ${f.severity}\nTitle: ${f.title}\nDetail: ${f.detail}`,
    { label: `verify:${f.file}`, phase: "Verify", schema: VERDICT_SCHEMA }
  ).then((v) => ({ ...f, verdict: v }));

phase("Review");

// Each finding is verified as soon as its dimension returns (pipeline — no barrier).
const reviewed = await pipeline(
  DIMENSIONS,
  (d) =>
    agent(
      `You are a senior BirdPlan reviewer covering ONLY the "${d.key}" dimension on branch ${ctx.branch}.\n` +
        `BirdPlan conventions for this dimension:\n${d.guidance}\n\n` +
        `1. Get the diff: ${diffCmd}\n` +
        `2. Changed files: ${ctx.changedFiles.join(", ")}. Read the FULL source of each relevant changed file, not just the hunk.\n` +
        `Report only issues that belong to the "${d.key}" dimension. Use severity critical/warning/info per this skill's conventions. For each finding, the \`detail\` must explain the underlying principle (WHY it matters), not just what to change, so the author learns the pattern. If you find nothing, return an empty findings array. Do not invent issues to fill space.`,
      { label: `review:${d.key}`, phase: "Review", schema: FINDINGS_SCHEMA }
    ),
  (review, d) =>
    parallel((review?.findings || []).map((f) => () => verify(f).then((vf) => ({ ...vf, dimension: d.key }))))
);

const confirmed = reviewed
  .flat()
  .filter(Boolean)
  .filter((f) => f.verdict && !f.verdict.refuted);

return { confirmed, dimensionsRun: DIMENSIONS.map((d) => d.key) };
```

**Scaling:** for a large or explicitly "thorough" review, have `verify` run 3 skeptics per finding and drop a finding when ≥2 refute it. For a small diff, the single verifier is enough.

**Priority order** (used to sort the findings and calibrate severity):

1. **Auth & ownership** — missing `authenticate(c)`, unscoped cross-user queries, missing editor/owner checks, IDOR
2. **Security** — NoSQL/operator injection, mass-assignment, credential leaks, trusting client-sent identity
3. **Races & data integrity** — check-then-act, non-atomic read-modify-write, non-idempotent roster/lifelist ops
4. **API backwards compatibility** — removed/renamed shared-type fields, response-shape changes that break the persisted cache or deployed clients
5. **BirdPlan API patterns** — missing `connect()`, hand-rolled errors instead of `HTTPException`, missing `.js` ESM extensions, schema/type drift
6. **Performance** — N+1 queries, missing `.lean()`, unbounded/un-indexed queries, over-fetching, serializable awaits
7. **Frontend data** — non-URL query keys, bypassing `useTripMutation`/optimistic cache, missing `QUERY_CACHE_BUSTER` bump
8. **React style** — new `useEffect`/`useMemo` that should be derivation, lazy init, or a custom hook
9. **Error UX** — toast instead of inline where the user can act; swallowed errors
10. **Type correctness** — `any`/unchecked casts, unhandled null from Mongo, likely `typecheck` breaks
11. **No code comments** — added explanatory comments that aren't genuine upstream-bug/regex/workaround notes
12. **Clarity nits** — unclear naming, dead code, minor convention drift (`[info]`)

### 4. Format the output

Your finding set is `result.confirmed` (or, in the fallback path, your inline findings). Format as:

1. **Executive summary** (2-3 sentences): what the PR does, overall quality, most important finding.
2. **Top findings** (3-5 detailed items): severity tag, `file:line`, what's wrong, the principle (WHY it matters), how to fix.
3. **Additional findings** (grouped one-liners): consolidated by category, same-class issues merged.

Severity levels:

- **`[critical]`** — Breaks auth/ownership, leaks data, allows injection, corrupts data via a race, breaks deployed clients or the persisted offline cache, or soft-locks users
- **`[warning]`** — Performance issue, missing atomicity, anti-pattern, poor error UX, type hole likely to break `typecheck`
- **`[info]`** — Style/convention (including no-comments and `useEffect`/`useMemo` where minor), naming, minor improvement

### 5. Local verification

When verifying suspicions locally, run the project's correctness gate from the repo root (there is no test suite):

```bash
npm run typecheck   # builds backend + frontend, typechecks scripts + shared — the primary gate
npm run lint        # ESLint (frontend)
```

Re-run `typecheck` especially when a change spans workspaces (a `@birdplan/shared` type change flows into both frontend and backend). Prefer running these once to confirm a real break rather than speculating.

### 6. Summary

After the findings:

- Count of findings by severity (e.g., "2 critical, 3 warnings, 1 info")
- If critical issues exist, which ones to fix first
- If `shared/types.ts` was touched, whether both sides still typecheck and whether the change is backwards-compatible (including whether `QUERY_CACHE_BUSTER` needs bumping)
- If **no issues found**: "Your code looks great! No issues detected."

Use a friendly, encouraging tone throughout. Every finding should teach: state the principle so the author learns it, then let them make the fix themselves. The goal is feedback that levels up the developer, not fixes handed over, and not gatekeeping.
