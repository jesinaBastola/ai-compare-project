# AI Compare Project

Contains two services, matching the architecture:

```
compare-api  -->  tool-profile-api  -->  (its own data)
(port 3000)       (port 4000)
```

- **tool-profile-api** - single source of truth for AI tool data
- **compare-api** - fetches tool data from tool-profile-api and compares tools

## Run both with ONE command

From this root folder (first time only):
```bash
npm install
npm run install:all
```

Then, every time you want to run the project:
```bash
npm start
```

This starts both servers together in one terminal (color-coded logs: blue =
tool-profile-api, green = compare-api). Press `Ctrl+C` to stop both.

## Check it's working

- `http://localhost:4000/` - tool-profile-api health check
- `http://localhost:4000/api-docs` - tool-profile-api Swagger docs
- `http://localhost:3000/` - compare-api health check
- `http://localhost:3000/api-docs` - compare-api Swagger docs, try `POST /api/v1/compare` with:
  ```json
  { "tools": ["chatgpt", "claude", "gemini"] }
  ```

## Project structure

```
ai-compare-project/
├── package.json          <- root: runs both services together
├── tool-profile-api/     <- service 1 (data source)
└── compare-api/          <- service 2 (comparison logic)
```

## Connecting to the REAL Tool Profile API later

Right now `compare-api/.env` points at the `tool-profile-api` in this same
project (`http://localhost:4000/api/tools`). Once your mentor gives you the
real Tool Profile API's address, just change that one line in
`compare-api/.env` - nothing else needs to change.
