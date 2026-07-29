// controllers/toolController.js
const tools = require("../data/tools");

/**
 * GET /api/tools
 * Returns a list of all tool slugs + names (lightweight index).
 */
function listTools(req, res) {
  const list = Object.values(tools).map((t) => ({ slug: t.slug, name: t.name, category: t.category }));
  res.status(200).json({ success: true, tools: list });
}

/**
 * GET /api/tools/:slug
 * Returns the full profile for one tool.
 */
function getToolBySlug(req, res) {
  const tool = tools[req.params.slug];

  if (!tool) {
    return res.status(404).json({ success: false, error: `Tool not found: ${req.params.slug}` });
  }

  res.status(200).json(tool);
}

module.exports = { listTools, getToolBySlug };
