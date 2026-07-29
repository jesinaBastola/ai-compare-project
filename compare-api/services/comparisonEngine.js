// services/comparisonEngine.js

/**
 * Build a feature comparison matrix.
 * Collects the union of every feature name across all tools,
 * then for each feature records true/false per tool slug.
 */
function buildFeatureMatrix(tools) {
  const allFeatureNames = new Set();
  tools.forEach((tool) => {
    Object.keys(tool.features || {}).forEach((f) => allFeatureNames.add(f));
  });

  return Array.from(allFeatureNames).map((feature) => {
    const values = {};
    tools.forEach((tool) => {
      values[tool.slug] = Boolean(tool.features?.[feature]);
    });
    return { feature, values };
  });
}

/**
 * Build a pricing comparison matrix.
 * Collects the union of every plan name (e.g. "Free", "Pro"),
 * then for each plan records the price string per tool slug.
 * If a tool doesn't have that plan, value is "—".
 */
function buildPricingMatrix(tools) {
  const allPlanNames = new Set();
  tools.forEach((tool) => {
    (tool.pricing || []).forEach((p) => allPlanNames.add(p.plan));
  });

  return Array.from(allPlanNames).map((plan) => {
    const values = {};
    tools.forEach((tool) => {
      const match = (tool.pricing || []).find((p) => p.plan === plan);
      values[tool.slug] = match ? match.price : "—";
    });
    return { plan, values };
  });
}

/**
 * Normalize ratings into a simple array for the response.
 */
function buildRatings(tools) {
  return tools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    ratings: tool.ratings
  }));
}

module.exports = { buildFeatureMatrix, buildPricingMatrix, buildRatings };
