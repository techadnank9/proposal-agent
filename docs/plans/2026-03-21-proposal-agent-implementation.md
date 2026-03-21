# Proposal Agent Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a demo-ready Next.js SaaS app that generates structured freelance proposals from a URL and/or job description using Apify and an OpenAI-compatible API.

**Architecture:** A single Next.js App Router app will handle the landing page, generator workspace, and `/api/generate` route. Shared helpers in `lib/` will normalize scraped content, build the LLM prompt, and validate returned JSON so the UI can render editable proposal sections safely.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Vitest, Testing Library, Apify API, OpenAI-compatible chat completions API

---

### Task 1: Scaffold the app shell

**Files:**
- Create: `/Users/adnan/Documents/proposal-agent/package.json`
- Create: `/Users/adnan/Documents/proposal-agent/app/layout.tsx`
- Create: `/Users/adnan/Documents/proposal-agent/app/page.tsx`
- Create: `/Users/adnan/Documents/proposal-agent/app/globals.css`
- Create: `/Users/adnan/Documents/proposal-agent/tsconfig.json`
- Create: `/Users/adnan/Documents/proposal-agent/next.config.ts`
- Create: `/Users/adnan/Documents/proposal-agent/postcss.config.mjs`
- Create: `/Users/adnan/Documents/proposal-agent/components.json`
- Create: `/Users/adnan/Documents/proposal-agent/lib/utils.ts`

**Step 1: Write the failing test**

Create a smoke test that renders the page headline and input controls.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand`
Expected: FAIL because app files are not implemented.

**Step 3: Write minimal implementation**

Scaffold the Next.js app, Tailwind config, and base page structure.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand`
Expected: PASS for the smoke test.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: scaffold proposal agent app"
```

### Task 2: Install and wire required shadcn components

**Files:**
- Modify: `/Users/adnan/Documents/proposal-agent/components.json`
- Create: `/Users/adnan/Documents/proposal-agent/components/ui/*`
- Modify: `/Users/adnan/Documents/proposal-agent/app/globals.css`

**Step 1: Write the failing test**

Write a component test asserting the landing and generator sections render with card, tabs, and buttons.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand`
Expected: FAIL due to missing shadcn components.

**Step 3: Write minimal implementation**

Use shadcn MCP/CLI to add:

- `button`
- `card`
- `input`
- `textarea`
- `tabs`
- `dialog`
- `skeleton`
- `badge`

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand`
Expected: PASS with shadcn-backed UI rendering.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add shadcn ui components"
```

### Task 3: Add shared domain types and prompt helpers

**Files:**
- Create: `/Users/adnan/Documents/proposal-agent/lib/types.ts`
- Create: `/Users/adnan/Documents/proposal-agent/lib/prompt.ts`
- Create: `/Users/adnan/Documents/proposal-agent/lib/validation.ts`
- Test: `/Users/adnan/Documents/proposal-agent/lib/prompt.test.ts`

**Step 1: Write the failing test**

Test prompt input shaping and proposal schema validation.

**Step 2: Run test to verify it fails**

Run: `npm test -- lib/prompt.test.ts --runInBand`
Expected: FAIL because helper modules do not exist.

**Step 3: Write minimal implementation**

Create proposal types, prompt generation helpers, and safe parsing/validation.

**Step 4: Run test to verify it passes**

Run: `npm test -- lib/prompt.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add proposal prompt helpers"
```

### Task 4: Implement Apify scraping helpers

**Files:**
- Create: `/Users/adnan/Documents/proposal-agent/lib/apify.ts`
- Test: `/Users/adnan/Documents/proposal-agent/lib/apify.test.ts`

**Step 1: Write the failing test**

Test URL validation and dataset normalization into title, description, and services.

**Step 2: Run test to verify it fails**

Run: `npm test -- lib/apify.test.ts --runInBand`
Expected: FAIL because scraper helpers are missing.

**Step 3: Write minimal implementation**

Implement Actor invocation, response polling, and content reduction helpers.

**Step 4: Run test to verify it passes**

Run: `npm test -- lib/apify.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add apify scraping helpers"
```

### Task 5: Implement LLM client and generation route

**Files:**
- Create: `/Users/adnan/Documents/proposal-agent/lib/llm.ts`
- Create: `/Users/adnan/Documents/proposal-agent/app/api/generate/route.ts`
- Test: `/Users/adnan/Documents/proposal-agent/app/api/generate/route.test.ts`

**Step 1: Write the failing test**

Test validation failure, scrape fallback behavior, and successful JSON response shape.

**Step 2: Run test to verify it fails**

Run: `npm test -- app/api/generate/route.test.ts --runInBand`
Expected: FAIL because route and LLM client do not exist.

**Step 3: Write minimal implementation**

Implement the route handler, LLM request helper, and error handling.

**Step 4: Run test to verify it passes**

Run: `npm test -- app/api/generate/route.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add proposal generation api"
```

### Task 6: Build the generator UI and editable output

**Files:**
- Modify: `/Users/adnan/Documents/proposal-agent/app/page.tsx`
- Create: `/Users/adnan/Documents/proposal-agent/components/proposal-agent.tsx`
- Create: `/Users/adnan/Documents/proposal-agent/components/proposal-editor.tsx`
- Create: `/Users/adnan/Documents/proposal-agent/components/proposal-preview-dialog.tsx`
- Create: `/Users/adnan/Documents/proposal-agent/components/loading-state.tsx`
- Test: `/Users/adnan/Documents/proposal-agent/components/proposal-agent.test.tsx`

**Step 1: Write the failing test**

Test generate button loading state, tab switching, and editable content rendering from proposal JSON.

**Step 2: Run test to verify it fails**

Run: `npm test -- components/proposal-agent.test.tsx --runInBand`
Expected: FAIL because the generator UI is not implemented.

**Step 3: Write minimal implementation**

Build the responsive UI with the required shadcn components and copy interactions.

**Step 4: Run test to verify it passes**

Run: `npm test -- components/proposal-agent.test.tsx --runInBand`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: build proposal generator ui"
```

### Task 7: Add configuration, docs, and verification

**Files:**
- Create: `/Users/adnan/Documents/proposal-agent/.env.example`
- Create: `/Users/adnan/Documents/proposal-agent/README.md`

**Step 1: Write the failing test**

If appropriate, add a light smoke test for setup assumptions or a docs-linked verification note.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand`
Expected: FAIL if new setup coverage was added.

**Step 3: Write minimal implementation**

Document required env vars, local setup, and demo flow.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "docs: add setup and demo instructions"
```
