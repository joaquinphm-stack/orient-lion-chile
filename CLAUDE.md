# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project: Orient Lion Chile

Landing + storefront for electric cargo trikes. **Next.js 15 (App Router) + TypeScript + Supabase**
(Postgres / Auth / Storage). Live: https://orient-lion-chile.vercel.app

- **Supabase project** `orient-lion` (ref `jozqjwkutcqeiereobun`). The publishable (anon) key is
  committed in `lib/supabase/config.ts` as a fallback literal — this is intentional and safe (it is
  designed to be public and is protected by RLS). The `service_role` key is never used or committed.
- **Admin account**: `joaquinphm@gmail.com` (password set out of band; `profiles.role = 'admin'`).
  Auth is email+password; email confirmation is auto-confirmed by a DB trigger (no SMTP configured).
- **Product & hero images** live in the Supabase Storage bucket `product-images` and are referenced
  by public URL — they are NOT in the repo or the deploy payload.
- **This machine has no `node`, `npm`, or `gh`.** A standalone Node is fetched into the session
  scratchpad and prepended to `PATH` for `npm install` / `npm run build` (past sessions leave a
  reusable `node-v20.*-darwin-x64` under `/private/tmp/claude-*/.../scratchpad/`).
- **Deploy** is via GitHub: `git commit` + `git push origin main` to
  `joaquinphm-stack/orient-lion-chile`; the Vercel git integration auto-builds production at
  `orient-lion-chile.vercel.app` (team `proyecto29`, project `orient-lion-chile`,
  production branch `main`). Push auth is HTTPS + a `repo`-scoped PAT in the macOS keychain
  (account `joaquinphm-stack`); no SSH keys. `vercel.json` pins `{"framework": "nextjs"}`, which
  is what stops git builds from failing with `STATIC_BUILD_NO_OUT_DIR`. The inline
  `deploy_to_vercel` MCP is a fallback only (the full source tree is too large to send reliably
  in one call).
- Running `npm run build` while `npm run dev` is active corrupts `.next`; stop dev and `rm -rf .next`
  first.
