const gitConfigService = require('../services/gitConfigService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const getConfig = async (req, res, next) => {
  try {
    const config = await gitConfigService.getGitConfig();
    logger.info('Git config retrieved successfully');
    return responseFormatter.success(res, 'Git config retrieved successfully', config);
  } catch (error) {
    logger.error(`Error getting Git config: ${error.message}`);
    next(error);
  }
};

const setUserConfig = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    await gitConfigService.setGitUserConfig(name, email);
    logger.info('Git user config updated successfully');
    return responseFormatter.success(res, 'Git user config updated successfully');
  } catch (error) {
    logger.error(`Error setting Git user config: ${error.message}`);
    next(error);
  }
};

const setEditorConfig = async (req, res, next) => {
  try {
    const { editor } = req.body;
    await gitConfigService.setGitEditorConfig(editor);
    logger.info('Git editor config updated successfully');
    return responseFormatter.success(res, 'Git editor config updated successfully');
  } catch (error) {
    logger.error(`Error setting Git editor config: ${error.message}`);
    next(error);
  }
};

const addAlias = async (req, res, next) => {
  try {
    const { alias, command } = req.body;
    await gitConfigService.addGitAlias(alias, command);
    logger.info(`Git alias '${alias}' added successfully`);
    return responseFormatter.success(res, `Git alias '${alias}' added successfully`);
  } catch (error) {
    logger.error(`Error adding Git alias: ${error.message}`);
    next(error);
  }
};

const removeAlias = async (req, res, next) => {
  try {
    const { alias } = req.params;
    await gitConfigService.removeGitAlias(alias);
    logger.info(`Git alias '${alias}' removed successfully`);
    return responseFormatter.success(res, `Git alias '${alias}' removed successfully`);
  } catch (error) {
    logger.error(`Error removing Git alias: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getConfig,
  setUserConfig,
  setEditorConfig,
  addAlias,
  removeAlias,
};