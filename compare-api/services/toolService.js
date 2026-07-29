// services/toolService.js
//
// ARCHITECTURE (per mentor):
// Compare API → GET Tool Profile API (per tool) → aggregate/compare.
// The Tool Profile service is the single source of truth for tool data.
// This service NEVER touches a database directly - it only calls the
// Tool Profile API.
//
// TOOL_PROFILE_API_URL is required in normal operation.
// USE_MOCK_DATA=true is an explicit, deliberate opt-in for local testing
// before the real Tool Profile API URL is available - it is NOT a silent
// default, and should be removed once the real service is wired up.

const TOOL_PROFILE_API_URL = process.env.TOOL_PROFILE_API_URL;
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true";

let mockTools = null;
if (USE_MOCK_DATA) {
  mockTools = require("../data/tools"); // only loaded when explicitly testing
}

if (!TOOL_PROFILE_API_URL && !USE_MOCK_DATA) {
  // Fail loudly at startup rather than silently guessing - this is a
  // deliberate architectural requirement, not an edge case to hide.
  throw new Error(
    "TOOL_PROFILE_API_URL is not set. Configure it in .env to point at the " +
    "Tool Profile service. (For local testing only, set USE_MOCK_DATA=true instead.)"
  );
}

/**
 * Fetch a single tool profile from the Tool Profile API.
 * Returns null if the tool doesn't exist (404); throws on any other failure.
 */
async function fetchFromToolProfileService(slug) {
  const res = await fetch(`${TOOL_PROFILE_API_URL}/${encodeURIComponent(slug)}`);

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Tool Profile API returned ${res.status} for slug "${slug}"`);
  }

  return res.json();
}

/**
 * Fetch multiple tool profiles by slug from the Tool Profile API
 * (or from mock data, only if USE_MOCK_DATA=true was explicitly set).
 */
async function getToolsBySlugs(slugs) {
  const found = [];
  const notFound = [];

  if (USE_MOCK_DATA) {
    slugs.forEach((slug) => {
      const tool = mockTools[slug];
      if (tool) found.push(tool);
      else notFound.push(slug);
    });
    return { found, notFound };
  }

  // Primary path: call the Tool Profile API for each requested tool.
  await Promise.all(
    slugs.map(async (slug) => {
      const tool = await fetchFromToolProfileService(slug);
      if (tool) found.push(tool);
      else notFound.push(slug);
    })
  );

  return { found, notFound };
}

module.exports = { getToolsBySlugs };
