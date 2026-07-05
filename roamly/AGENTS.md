<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- The Next.js app lives in the `roamly/` subdirectory, not the repo root. Run all `npm` commands from `roamly/` (or pass `--prefix roamly`). Node 22 is fine.
- Standard scripts are in `roamly/package.json`: `npm run dev` (Next.js 16 + Turbopack on port 3000), `npm run lint`, `npm run build`, `npm run start`.
- `npm run dev` is the development target and serves the AI travel-planner homepage at http://localhost:3000. Fast Refresh works.
- The app is an AI itinerary planner: the homepage form posts to `POST /api/generate` (`src/app/api/generate/route.ts`), which calls OpenAI (`gpt-4o-2024-08-06`).
- `OPENAI_API_KEY` is required to actually generate an itinerary. Without it the route returns HTTP 500 ("Missing credentials") because the OpenAI client is instantiated at module load time. The homepage/form still render fine without the key; only generation fails.
- For the same module-load reason, `npm run build` fails at the "Collecting page data" step when `OPENAI_API_KEY` is unset (dev mode is unaffected since the route module is only loaded on first request). Set `OPENAI_API_KEY` before running `npm run build`.
