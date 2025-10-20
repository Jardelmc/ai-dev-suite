const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const categoryRoutes = require("./routes/categoryRoutes");
const promptRoutes = require("./routes/promptRoutes");
const projectRoutes = require("./routes/projectRoutes");
const codeWriterRoutes = require("./routes/codeWriterRoutes");
const gitRoutes = require("./routes/gitRoutes");
const analyzerRoutes = require("./routes/analyzerRoutes");
const ignoreRoutes = require('./routes/ignoreRoutes');
const vscodeRoutes = require('./routes/vscodeRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const templateRoutes = require('./routes/templateRoutes');
const projectBuilderRoutes = require('./routes/projectBuilderRoutes');
const faviconRoutes = require('./routes/faviconRoutes');
const explorerRoutes = require('./routes/explorerRoutes');
const errorMiddleware = require("./middlewares/errorMiddleware");
const logger = require("./utils/logger");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    logger.info(`${req.method} ${req.originalUrl}`);
  }
  next();
});
app.use("/api/categories", categoryRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/code-writer", codeWriterRoutes);
app.use("/api/git", gitRoutes);
app.use("/api/analyzer", analyzerRoutes);
app.use('/api/ignores', ignoreRoutes);
app.use('/api/vscode', vscodeRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/project-builder', projectBuilderRoutes);
app.use('/api/favicons', faviconRoutes);
app.use('/api/explorer', explorerRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Dev Suite API is running",
    timestamp: new Date().toISOString(),
    services: {
      "prompt-library": "active",
      "code-writer": "active",
      "git-management": "active",
      "project-analyzer": "active",
      "metrics": "active",
    },
  });
});
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested API resource was not found.",
    },
  });
});
app.use(errorMiddleware);

module.exports = app;