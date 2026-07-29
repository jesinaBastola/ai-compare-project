// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const compareRoutes = require("./routes/compareRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check
 *     description: Confirms the API server is running.
 *     responses:
 *       200:
 *         description: Server is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: compare-api
 *                 time:
 *                   type: string
 *                   example: "2026-07-21T05:40:01.418Z"
 */
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "compare-api", time: new Date().toISOString() });
});

// Swagger API docs - available at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Main API routes
app.use("/api/v1", compareRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, errors: ["Route not found."] });
});

app.listen(PORT, () => {
  console.log(`compare-api running on http://localhost:${PORT}`);
});
