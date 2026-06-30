# PageMind

An experiment platform exploring how landing pages can auto-improve through
experimentation and simulated user behavior. Five landing page variants are
tested for **Flo**, an AI meeting notetaker for startup founders, against
simulated behavior from six visitor personas. The system isolates patterns
specific to the target ICP (Startup Founders) — not overall engagement —
and uses those patterns to synthesize a new page variant (V6) via a live
call to the Claude API, with a full decision log explaining every choice.

## What's inside

- `src/PageMind.jsx` — the entire app: 5 landing page mockups, the
  simulation engine, behavior analysis, leaderboard, and the V6 generator.
- `api/generate-v6.js` — a serverless function that holds the real
  Anthropic API key server-side and proxies requests from the browser.
  The key is never exposed to the client.

## Run it locally

```bash
npm install
npm run dev
```

This starts the Vite dev server. The `/api/generate-v6` route only works
when deployed to Vercel (or run via `vercel dev`), since it depends on
Vercel's serverless function runtime.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to vercel.com, sign in with GitHub, and import the repo.
3. In Project Settings → Environment Variables, add:
   - `ANTHROPIC_API_KEY` — your Anthropic API key (get one at
     console.anthropic.com)
4. Deploy. Vercel auto-detects the Vite project and the `/api` folder as
   serverless functions — no extra config needed.

## How V6 generation works

1. The frontend builds a raw, un-summarized event log of founder-only
   behavior across all 5 pages (scroll depth, bounce rate, CTA rate, and
   per-section dwell time in seconds).
2. It also builds a `CONTENT_POOL` of every actual tested line of copy
   from the 5 pages, tagged by source page.
3. Both are sent to `/api/generate-v6`, which forwards them to Claude
   with instructions to pick the best-performing option per content slot
   — Claude may only select from real tested copy, never invent new
   copy. This keeps every element in V6 auditable back to a real,
   tested source.
4. Claude's response (JSON) is parsed and rendered as both the new V6
   landing page and a decision log explaining each choice with the
   actual data that justified it.
5. If the API call fails for any reason, the app falls back to a
   pre-reasoned static decision log and clearly labels it as a fallback
   rather than silently pretending the live call succeeded.

## Editing the experiment

- `PAGES` — the 5 landing page definitions (headline, hypothesis, color).
- `PERSONAS` — the 6 visitor personas and their traffic share.
- `BEH` — raw behavioral weights per persona per page (scroll, bounce,
  CTA, per-section dwell multipliers). This is the easiest place to
  change "what if visitors behaved differently."
- `aggPage()` — the engagement scoring formula (40% CTA, 30% scroll,
  20% dwell, 10% bounce by default).
- `CONTENT_POOL` — the real copy Claude can choose from for V6.
