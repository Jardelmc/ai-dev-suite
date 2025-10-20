const analyzerService = require('../services/analyzerService');
const projectService = require('../services/projectService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const path = require('path');

const analyzeProject = async (req, res, next) => {
  try {
    const { projectId, projectDir, excludedSubprojectIds } = req.body;
    let targetDirectory = projectDir;
    let projectName = 'Unknown Project';

    if (projectId) {
      const project = await projectService.getProjectById(projectId);
      if (!project) {
        return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
      }
      if (!project.directory) {
        return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project does not have a directory configured.');
      }
      targetDirectory = project.directory;
      projectName = project.title;
    }

    if (!targetDirectory) {
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project directory or projectId with configured directory is required.');
    }

    const result = await analyzerService.analyzeProject(targetDirectory, projectId, excludedSubprojectIds);
    logger.info(`Project analysis completed for directory: ${targetDirectory}`);
    return responseFormatter.success(res, 'Project analyzed successfully', {
      projectContent: result.projectContent,
      base64: result.base64,
      projectName: projectName,
      directory: targetDirectory
    });
  } catch (error) {
    logger.error(`Error in project analysis: ${error.message}`);
    next(error);
  }
};

module.exports = {
  analyzeProject
};