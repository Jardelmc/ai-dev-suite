const gitService = require('../services/gitService');
const projectService = require('../services/projectService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const commitChanges = async (req, res, next) => {
  try {
    const { projectId, projectDir, commitMessage } = req.body;
    let targetDirectory = projectDir;
    
    if (projectId) {
      const project = await projectService.getProjectById(projectId);
      if (!project) {
        return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
      }
      if (!project.directory) {
        return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project does not have a directory configured.');
      }
      targetDirectory = project.directory;
    }

    if (!targetDirectory) {
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project directory or projectId with configured directory is required.');
    }

    const result = await gitService.processCommit(targetDirectory, commitMessage);
    logger.info(`Git commit processed for directory: ${targetDirectory}`);
    return responseFormatter.success(res, result.message, result);
  } catch (error) {
    logger.error(`Error in git commit: ${error.message}`);
    next(error);
  }
};

const revertChanges = async (req, res, next) => {
  try {
    const { projectId, projectDir } = req.body;
    let targetDirectory = projectDir;
    
    if (projectId) {
      const project = await projectService.getProjectById(projectId);
      if (!project) {
        return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
      }
      if (!project.directory) {
        return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project does not have a directory configured.');
      }
      targetDirectory = project.directory;
    }

    if (!targetDirectory) {
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project directory or projectId with configured directory is required.');
    }

    const result = await gitService.revertChanges(targetDirectory);
    logger.info(`Git revert processed for directory: ${targetDirectory}`);
    return responseFormatter.success(res, result.message, { directory: targetDirectory });
  } catch (error) {
    logger.error(`Error in git revert: ${error.message}`);
    next(error);
  }
};

const getStatus = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const status = await gitService.getGitStatusForProject(projectId);
        logger.info(`Git status retrieved for project: ${projectId}`);
        return responseFormatter.success(res, 'Git status retrieved successfully', status);
    } catch (error) {
        logger.error(`Error in git status: ${error.message}`);
        next(error);
    }
};

module.exports = {
  commitChanges,
  revertChanges,
  getStatus,
};