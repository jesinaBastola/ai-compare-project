# Tool Profile API

Single source of truth for AI tool data - pricing, features, ratings,
integrations, platforms, and supported models. The Compare API calls this
service instead of touching a database directly.

## Run it

```bash
npm install
npm start
```
Runs on `http://localhost:4000` by default (set `PORT` env var to change).

## Endpoints

**Health check**
```
GET /
```

**List all tools**
```
GET /api/tools
```

**Get one tool's full profile**
```
GET /api/tools/:slug
```
Example: `GET /api/tools/chatgpt`

Returns `404` if the slug doesn't exist.

## Connecting the Compare API to this service

In the `compare-api` project's `.env` file, set:
```
TOOL_PROFILE_API_URL=http://localhost:4000/api/tools
```

Then start both services (this one on port 4000, compare-api on port 3000).
The Compare API will now fetch real tool data from here instead of using
mock data.

## Replacing with a real database later

Currently `data/tools.js` holds tool data in a plain JS object. To connect
a real database, only `controllers/toolController.js` needs to change -
swap the `tools[slug]` lookups for real DB queries. Nothing else in this
project or in compare-api needs to change.
