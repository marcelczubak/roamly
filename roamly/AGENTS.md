<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- The Next.js app lives in the `roamly/` subdirectory, not the repo root. Run all `npm` commands from `roamly/` (or pass `--prefix roamly`). Node 22 is fine.
- Standard scripts are in `roamly/package.json`: `npm run dev` (Next.js 16 + Turbopack on port 3000), `npm run lint`, `npm run build`, `npm run start`.
- `npm run dev` is the development target and serves the AI travel-planner homepage at http://localhost:3000. Fast Refresh works.
- The app is an AI itinerary planner: the homepage form posts to `POST /api/generate` (`src/app/api/generate/route.ts`), which calls an LLM to produce a structured itinerary.
- Provider selection (`src/app/api/generate/route.ts`): if `OPENAI_API_KEY` is set it uses OpenAI (default model `gpt-4o-2024-08-06`); otherwise, if `GEMINI_API_KEY` is set it uses Gemini's OpenAI-compatible endpoint (default model `gemini-2.5-flash`). Override the model for either provider with `OPENAI_MODEL`. So with just the injected `GEMINI_API_KEY` present, itinerary generation works out of the box — no extra env needed.
- A key (`OPENAI_API_KEY` or `GEMINI_API_KEY`) is required to generate an itinerary. With no key the route throws "Missing credentials" (the client is created at module load); the homepage/form still render fine, only generation fails.
- For the same module-load reason, `npm run build` fails at the "Collecting page data" step when no key is set (dev mode is unaffected since the route module is only loaded on first request). Set a key before `npm run build`.
- Note: injected secrets (e.g. `GEMINI_API_KEY`) are only present in a freshly booted VM/session, not in a VM that was already running when the secret was added.
