// services/aiSummaryService.js
// Generates the AI-written sections: overview, summary, pros/cons,
// bestUseCases, recommendations, winner, faq.
//
// IMPORTANT RULE from the spec: the AI must only use the structured
// tool data we pass it - it must not invent features or pricing.
// We enforce that by (1) only giving it the fetched tool JSON, and
// (2) telling it explicitly in the prompt not to add anything else.

const Anthropic = tryRequireAnthropicSdk();

function tryRequireAnthropicSdk() {
  try {
    return require("@anthropic-ai/sdk");
  } catch (e) {
    return null; // SDK not installed yet - we'll fall back to mock mode
  }
}

const client =
  Anthropic && process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

function buildPrompt(tools, featureMatrix, pricingMatrix) {
  return `You are generating a factual AI-tool comparison for a website.

STRICT RULE: Only use the data given below. Do not invent features,
prices, ratings, or facts that are not present in this JSON. If you are
unsure about something, omit it rather than guessing.

TOOL DATA:
${JSON.stringify(tools, null, 2)}

FEATURE MATRIX:
${JSON.stringify(featureMatrix, null, 2)}

PRICING MATRIX:
${JSON.stringify(pricingMatrix, null, 2)}

Return ONLY valid JSON (no markdown fences, no preamble) matching exactly
this shape:

{
  "overview": "string, 2-3 sentences comparing the tools generally",
  "summary": "string, short executive summary",
  "prosCons": [
    { "slug": "tool-slug", "pros": ["..."], "cons": ["..."] }
  ],
  "bestUseCases": [
    { "slug": "tool-slug", "useCase": "string" }
  ],
  "recommendations": {
    "beginners": "slug",
    "professionals": "slug",
    "budget": "slug"
  },
  "winner": {
    "overall": "slug",
    "coding": "slug",
    "writing": "slug",
    "research": "slug",
    "speed": "slug",
    "value": "slug"
  },
  "faq": [
    { "question": "string", "answer": "string" }
  ]
}

For each winner category, pick the tool best supported by the data:
- overall: highest ratings.overall
- coding: has "Code Generation" feature and/or highest coding-relevant rating
- writing: best suited to writing tasks based on its category/features
- research: has "Web Browsing" feature and/or strong research use case
- speed: highest ratings.speed
- value: best ratings.valueForMoney relative to price
If the data doesn't clearly support a category, pick the closest reasonable
match from the given tools rather than inventing a new fact.`;
}

/**
 * Mock generator used when no ANTHROPIC_API_KEY is configured yet,
 * so the API is runnable/testable immediately during development.
 */
function generateMock(tools, featureMatrix, pricingMatrix) {
  const slugs = tools.map((t) => t.slug);

  const cheapest = tools.reduce((a, b) => {
    const priceA = parseFloat((a.pricing[1]?.price || "0").replace(/[^0-9.]/g, "")) || 0;
    const priceB = parseFloat((b.pricing[1]?.price || "0").replace(/[^0-9.]/g, "")) || 0;
    return priceB > 0 && priceB < priceA ? b : a;
  });

  const highestRated = tools.reduce((a, b) =>
    (b.ratings?.overall || 0) > (a.ratings?.overall || 0) ? b : a
  );

  const bestValue = tools.reduce((a, b) =>
    (b.ratings?.valueForMoney || 0) > (a.ratings?.valueForMoney || 0) ? b : a
  );

  const fastest = tools.reduce((a, b) =>
    (b.ratings?.speed || 0) > (a.ratings?.speed || 0) ? b : a
  );

  // "coding" winner: among tools that support Code Generation, pick the
  // highest-rated one. If none support it, fall back to the overall winner.
  const codeCapable = tools.filter((t) => t.features?.["Code Generation"]);
  const bestCoding = (codeCapable.length ? codeCapable : tools).reduce((a, b) =>
    (b.ratings?.overall || 0) > (a.ratings?.overall || 0) ? b : a
  );

  // "research" winner: among tools that support Web Browsing, pick the
  // highest-rated one. If none support it, fall back to the overall winner.
  const researchCapable = tools.filter((t) => t.features?.["Web Browsing"]);
  const bestResearch = (researchCapable.length ? researchCapable : tools).reduce((a, b) =>
    (b.ratings?.overall || 0) > (a.ratings?.overall || 0) ? b : a
  );

  // "writing" winner: prefer a tool whose category is writing-focused;
  // otherwise fall back to the tool with the highest ease-of-use rating.
  const writingFocused = tools.find((t) =>
    /writing/i.test(t.category || "")
  );
  const bestWriting =
    writingFocused ||
    tools.reduce((a, b) => (b.ratings?.easeOfUse || 0) > (a.ratings?.easeOfUse || 0) ? b : a);

  return {
    overview: `Comparing ${tools.map((t) => t.name).join(", ")} across pricing, features, and ratings.`,
    summary: `${highestRated.name} has the highest overall rating among the compared tools, while ${cheapest.name} offers the most affordable paid plan.`,
    prosCons: tools.map((t) => ({
      slug: t.slug,
      pros: Object.entries(t.features)
        .filter(([, v]) => v)
        .slice(0, 3)
        .map(([f]) => `Supports ${f}`),
      cons: Object.entries(t.features)
        .filter(([, v]) => !v)
        .slice(0, 2)
        .map(([f]) => `No ${f}`)
    })),
    bestUseCases: tools.map((t) => ({
      slug: t.slug,
      useCase: `Best for teams already using ${t.developer} products.`
    })),
    recommendations: {
      beginners: highestRated.slug,
      professionals: highestRated.slug,
      budget: cheapest.slug
    },
    winner: {
      overall: highestRated.slug,
      coding: bestCoding.slug,
      writing: bestWriting.slug,
      research: bestResearch.slug,
      speed: fastest.slug,
      value: bestValue.slug
    },
    faq: [
      {
        question: `Which is better, ${slugs[0]} or ${slugs[1]}?`,
        answer: `${highestRated.name} scores higher overall (${highestRated.ratings.overall}/5) based on current ratings data.`
      }
    ]
  };
}

async function generateComparisonSummary(tools, featureMatrix, pricingMatrix) {
  if (!client) {
    // No API key configured - return deterministic mock data instead
    // of failing, so the endpoint still works end-to-end.
    return generateMock(tools, featureMatrix, pricingMatrix);
  }

  const prompt = buildPrompt(tools, featureMatrix, pricingMatrix);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "");

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI response was not valid JSON: " + err.message);
  }
}

module.exports = { generateComparisonSummary };
