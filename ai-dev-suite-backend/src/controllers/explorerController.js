const explorerService = require('../services/explorerService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const openProject = async (req, res, next) => {
  try {
    const { directory } = req.body;
    const result = await explorerService.openInExplorer(directory);
    logger.info(`Explorer opened for directory: ${directory}`);
    return responseFormatter.success(res, result.message, result);
  } catch (error) {
    logger.error(`Error opening Explorer: ${error.message}`);
    next(error);
  }
};

module.exports = {
  openProject,
};