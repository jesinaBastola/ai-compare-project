// routes/compareRoutes.js
const express = require("express");
const router = express.Router();
const { compareTools } = require("../controllers/compareController");

/**
 * @swagger
 * /api/v1/compare:
 *   post:
 *     summary: Compare 2 or more AI tools
 *     description: >
 *       Fetches structured data for each requested tool, builds feature and
 *       pricing comparison matrices, and generates AI-written sections
 *       (overview, summary, pros/cons, best use cases, recommendations,
 *       winner, FAQ) - all in a single response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tools
 *             properties:
 *               tools:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: string
 *                 example: ["chatgpt", "claude", "gemini"]
 *     responses:
 *       200:
 *         description: Full comparison data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comparison:
 *                   type: object
 *       400:
 *         description: Invalid request (fewer than 2 tools, duplicates, etc.)
 *       404:
 *         description: One or more tool slugs not found
 */
router.post("/compare", compareTools);

module.exports = router;
