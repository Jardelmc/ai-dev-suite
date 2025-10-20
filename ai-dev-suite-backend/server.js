const app = require("./src/app");
const logger = require("./src/utils/logger");

const PORT = process.env.PORT || 5858;

app.listen(PORT, () => {
  logger.info(`AI Dev Suite server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 AI Dev Suite running at http://localhost:${PORT}`);
});
