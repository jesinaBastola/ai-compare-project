// utils/validate.js

function validateCompareRequest(body) {
  const errors = [];

  if (!body || !Array.isArray(body.tools)) {
    errors.push("`tools` must be an array of slugs.");
    return { valid: false, errors };
  }

  const slugs = body.tools.filter((s) => typeof s === "string" && s.trim() !== "");

  if (slugs.length < 2) {
    errors.push("At least 2 tools are required to compare.");
  }

  const uniqueSlugs = [...new Set(slugs)];
  if (uniqueSlugs.length !== slugs.length) {
    errors.push("Duplicate tool slugs are not allowed.");
  }

  return { valid: errors.length === 0, errors, slugs: uniqueSlugs };
}

module.exports = { validateCompareRequest };
