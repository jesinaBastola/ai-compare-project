// swagger.js
// Builds the OpenAPI spec used by swagger-ui-express.
// Docs are generated from the JSDoc comments placed above each route
// (see routes/compareRoutes.js and index.js).

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Compare API",
      version: "1.0.0",
      description:
        "A single API that compares 2 or more AI tools and returns pricing, " +
        "features, ratings, pros/cons, and an AI-generated verdict in one response."
    },
    servers: [
      { url: "http://localhost:3000", description: "Local server" }
    ]
  },
  // Files to scan for JSDoc @swagger comments
  apis: ["./index.js", "./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
