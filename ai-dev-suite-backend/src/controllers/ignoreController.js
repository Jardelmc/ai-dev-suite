const ignoreService = require('../services/ignoreService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const listIgnores = async (req, res, next) => {
  try {
    const ignores = await ignoreService.getAllIgnores();
    logger.info('Ignores retrieved successfully');
    return responseFormatter.success(res, 'Ignores retrieved successfully', { ignores });
  } catch (error) {
    logger.error('Error listing ignores', error.message);
    next(error);
  }
};

const getIgnoresForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project ID is required.');
    }

    const ignores = await ignoreService.getIgnoresForProject(projectId);
    logger.info(`Ignores retrieved for project ${projectId}`);
    return responseFormatter.success(res, 'Project ignores retrieved successfully', ignores);
  } catch (error) {
    logger.error('Error getting ignores for project', error.message);
    next(error);
  }
};

const createIgnore = async (req, res, next) => {
  try {
    const { path, scope, projectId } = req.body;
    const newIgnore = await ignoreService.createIgnore(path, scope, projectId);
    logger.info('Ignore created', newIgnore.path);
    return responseFormatter.success(res, 'Ignore created successfully', newIgnore, 201);
  } catch (error) {
    logger.error('Error creating ignore', error.message);
    next(error);
  }
};

const deleteIgnore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ignoreService.deleteIgnore(id);

    if (!deleted) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Ignore not found.');
    }

    logger.info('Ignore deleted', id);
    return responseFormatter.success(res, 'Ignore deleted successfully');
  } catch (error) {
    logger.error('Error deleting ignore', error.message);
    next(error);
  }
};

module.exports = {
  listIgnores,
  getIgnoresForProject,
  createIgnore,
  deleteIgnore
};