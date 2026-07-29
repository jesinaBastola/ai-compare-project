# Compare API

A single Express.js endpoint that compares 2+ AI tools and returns everything
the frontend needs (overview, pricing, features, ratings, pros/cons, winner,
FAQ) in one JSON response — matching the aipub.io `/compare` pattern.

## Run it

```bash
npm install
npm start        # or: node index.js
```

Server runs on `http://localhost:3000`.

## Endpoints (backend only - no frontend)

**Health check**
```
GET /
```

**Swagger API docs (interactive)**
```
GET /api-docs
```
Open this in a browser to see every endpoint documented, with a "Try it out"
button to test requests directly - no Postman needed.

**Compare tools**
```
POST /api/v1/compare
Content-Type: application/json

{ "tools": ["chatgpt", "claude", "gemini"] }
```

Rules: minimum 2 tools, no fixed maximum, unknown slugs return 404,
duplicate/less-than-2 slugs return 400.

## Project structure

```
index.js                       # app entry, health check, mounts routes
routes/compareRoutes.js        # POST /api/v1/compare
controllers/compareController.js  # orchestrates the full flow (step 1-6 below)
services/toolService.js        # fetches tool records (currently mock, swap for real DB)
services/comparisonEngine.js   # builds featureMatrix + pricingMatrix + ratings
services/aiSummaryService.js   # calls Claude API for overview/pros/cons/winner/faq
utils/validate.js              # request body validation
utils/normalize.js             # merges raw tool + AI data into the spec's Tool Object shape
data/tools.js                  # mock "database" of tool records
swagger.js                     # OpenAPI/Swagger config (docs generated from JSDoc comments)
```

This is a pure backend API - no frontend/UI included. Test it via `/api-docs`
(Swagger UI) or Postman.

## Request flow (matches the architecture diagram)

1. `validate.js` — checks `tools` array, min 2, no duplicates
2. `toolService.js` — fetches full records for each slug
3. `comparisonEngine.js` — builds feature matrix + pricing matrix from raw data
4. `aiSummaryService.js` — sends ONLY the fetched structured data to Claude,
   with an explicit instruction not to invent facts, and gets back JSON:
   overview, summary, pros/cons per tool, best use cases, recommendations,
   winner (by category), FAQ
5. `normalize.js` — merges DB data + AI pros/cons into the exact Tool Object shape
6. Controller assembles the final `{ success, comparison: {...} }` response

## Connecting to a real AI (Claude API)

Right now `aiSummaryService.js` falls back to a **mock generator** if no
`ANTHROPIC_API_KEY` is set, so the API runs out of the box. To use the real
Claude API:

```bash
npm install @anthropic-ai/sdk
```

Create a `.env` file:
```
ANTHROPIC_API_KEY=your_key_here
```

That's it — the service auto-detects the key and switches from mock to real
AI generation. No other code changes needed.

## Connecting to a real database

Replace the body of `services/toolService.js` with a real query
(MongoDB `find()`, Postgres `SELECT ... WHERE slug = ANY($1)`, etc.) as long
as it returns objects shaped like the entries in `data/tools.js`. Nothing
else in the app needs to change.

## Caching (for the "easily cacheable" requirement)

Since `tools` sorted + joined (e.g. `chatgpt+claude+gemini`) makes a
deterministic cache key, you can wrap the controller with Redis:

```js
const cacheKey = `compare:${slugs.slice().sort().join("+")}`;
const cached = await redis.get(cacheKey);
if (cached) return res.json(JSON.parse(cached));
// ...compute comparison...
await redis.set(cacheKey, JSON.stringify(response), "EX", 3600);
```

## What to show your team lead

1. `GET /` → health check works
2. `POST /api/v1/compare` with 2, 3, and 5 tools → one response, no extra
   API calls needed by frontend
3. Bad input (1 tool, unknown slug) → proper 400/404 errors
4. Point out the mock-vs-real AI toggle and mock-vs-real DB swap points —
   shows you understood the architecture, not just hardcoded a demo
