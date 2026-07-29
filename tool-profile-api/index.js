// index.js
require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const toolRoutes = require("./routes/toolRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check
 *     description: Confirms the Tool Profile API is running.
 *     responses:
 *       200:
 *         description: Server is alive
 */
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "tool-profile-api", time: new Date().toISOString() });
});

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", toolRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`tool-profile-api running on http://localhost:${PORT}`);
});
