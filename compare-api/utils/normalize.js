// utils/normalize.js

/**
 * Merge the raw DB tool object with its AI-generated pros/cons/overview
 * into the exact "Tool Object" shape required by the spec.
 */
function normalizeTool(rawTool, aiProsCons) {
  return {
    id: rawTool.id,
    slug: rawTool.slug,
    name: rawTool.name,
    logo: rawTool.logo,
    website: rawTool.website,
    developer: rawTool.developer,
    category: rawTool.category,
    overview: rawTool.overviewRaw,
    pricing: rawTool.pricing,
    features: rawTool.features,
    pros: aiProsCons?.pros || [],
    cons: aiProsCons?.cons || [],
    ratings: rawTool.ratings,
    integrations: rawTool.integrations,
    platforms: rawTool.platforms,
    supportedModels: rawTool.supportedModels
  };
}

module.exports = { normalizeTool };
