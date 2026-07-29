// controllers/compareController.js
const { validateCompareRequest } = require("../utils/validate");
const { normalizeTool } = require("../utils/normalize");
const cache = require("../utils/cache");
const toolService = require("../services/toolService");
const comparisonEngine = require("../services/comparisonEngine");
const aiSummaryService = require("../services/aiSummaryService");

async function compareTools(req, res) {
  try {
    // 1. Validate request
    const { valid, errors, slugs } = validateCompareRequest(req.body);
    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    // 1b. Check cache - avoids re-fetching/re-generating for a comparison
    // that was already computed recently (e.g. "chatgpt-vs-claude").
    const cacheKey = cache.buildCacheKey(slugs);
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, comparison: cached, cached: true });
    }

    // 2. Fetch tools from the Tool Profile service
    const { found, notFound } = await toolService.getToolsBySlugs(slugs);

    if (notFound.length > 0) {
      return res.status(404).json({
        success: false,
        errors: [`Unknown tool slug(s): ${notFound.join(", ")}`]
      });
    }

    // 3. Build structured comparison data
    const featureMatrix = comparisonEngine.buildFeatureMatrix(found);
    const pricingMatrix = comparisonEngine.buildPricingMatrix(found);
    const ratings = comparisonEngine.buildRatings(found);

    // 4. AI-generated sections (overview, summary, pros/cons, winner, faq...)
    const ai = await aiSummaryService.generateComparisonSummary(
      found,
      featureMatrix,
      pricingMatrix
    );

    // 5. Normalize tool objects (merge raw DB data + AI pros/cons per tool)
    const tools = found.map((rawTool) => {
      const aiForTool = ai.prosCons?.find((p) => p.slug === rawTool.slug);
      return normalizeTool(rawTool, aiForTool);
    });

    // 6. Assemble final response
    const comparison = {
      overview: ai.overview,
      summary: ai.summary,
      tools,
      featureMatrix,
      pricingMatrix,
      prosCons: ai.prosCons,
      ratings,
      bestUseCases: ai.bestUseCases,
      recommendations: ai.recommendations,
      winner: ai.winner,
      faq: ai.faq
    };

    // 7. Cache it so the next identical request (same tools, any order)
    // is served instantly without recomputation.
    cache.set(cacheKey, comparison);

    return res.status(200).json({ success: true, comparison });
  } catch (err) {
    console.error("compareTools error:", err);
    return res.status(500).json({
      success: false,
      errors: ["Internal server error while generating comparison."]
    });
  }
}

module.exports = { compareTools };
