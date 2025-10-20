const faviconService = require('../services/faviconService');
const projectService = require('../services/projectService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const generate = async (req, res, next) => {
  try {
    const { projectId, appName, imageBase64 } = req.body;
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
    }

    if (!project.directory) {
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project does not have a directory configured.');
    }

    const result = await faviconService.generateFavicons(
      project.directory,
      appName,
      imageBase64
    );
    logger.info(`Favicons generated successfully for project: ${project.title}`);
    return responseFormatter.success(res, result.message, result);
  } catch (error) {
    logger.error(`Error in favicon generation controller: ${error.message}`);
    next(error);
  }
};

module.exports = {
  generate
};