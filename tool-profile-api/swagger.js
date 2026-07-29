// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tool Profile API",
      version: "1.0.0",
      description:
        "Single source of truth for AI tool data - pricing, features, " +
        "ratings, integrations, platforms, and supported models."
    },
    servers: [
      { url: "http://localhost:4000", description: "Local server" }
    ]
  },
  apis: ["./index.js", "./routes/*.js"]
};

module.exports = swaggerJsdoc(options);
