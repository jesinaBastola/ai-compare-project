// routes/toolRoutes.js
const express = require("express");
const router = express.Router();
const { listTools, getToolBySlug } = require("../controllers/toolController");

/**
 * @swagger
 * /api/tools:
 *   get:
 *     summary: List all tools
 *     description: Returns a lightweight index of every tool (slug, name, category).
 *     responses:
 *       200:
 *         description: List of tools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tools:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slug: { type: string }
 *                       name: { type: string }
 *                       category: { type: string }
 */
router.get("/tools", listTools);

/**
 * @swagger
 * /api/tools/{slug}:
 *   get:
 *     summary: Get one tool's full profile
 *     description: Returns pricing, features, ratings, integrations, platforms, and supported models for one tool.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: chatgpt
 *     responses:
 *       200:
 *         description: Full tool profile
 *       404:
 *         description: Tool not found
 */
router.get("/tools/:slug", getToolBySlug);

module.exports = router;
