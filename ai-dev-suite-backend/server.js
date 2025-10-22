const app = require("./src/app");
const logger = require("./src/utils/logger");
const { initializeDatabase } = require('./src/services/dbVerify');

const PORT = process.env.PORT || 5858;

const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`AI Dev Suite server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🚀 AI Dev Suite running at http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to initialize database and start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();