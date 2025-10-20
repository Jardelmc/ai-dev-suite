const vscodeService = require('../services/vscodeService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const openProject = async (req, res, next) => {
  try {
    const { directory } = req.body;
    const result = await vscodeService.openInVSCode(directory);
    logger.info(`VS Code opened for directory: ${directory}`);
    return responseFormatter.success(res, result.message, result);
  } catch (error) {
    logger.error(`Error opening VS Code: ${error.message}`);
    next(error);
  }
};

module.exports = {
  openProject,
};