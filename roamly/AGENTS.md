<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- The Next.js app lives in the `roamly/` subdirectory, not the repo root. Run all `npm` commands from `roamly/` (or pass `--prefix roamly`). Node 22 is fine.
- Standard scripts are in `roamly/package.json`: `npm run dev` (Next.js 16 + Turbopack on port 3000), `npm run lint`, `npm run build`, `npm run start`.
- `npm run dev` is the development target and serves the homepage at http://localhost:3000. Fast Refresh works.
- Known pre-existing issues (not environment problems, do not "fix" as part of setup):
  - `npm run build` currently fails type-checking on `api/generate/route.ts` (`openai.beta.chat.completions.parse` does not exist in the installed `openai` v6).
  - The `api/generate` route lives outside `src/app`, so it is not served (returns 404) and is unused by the homepage.
  - The `/api/generate` route needs an `OPENAI_API_KEY` env var to call OpenAI.
