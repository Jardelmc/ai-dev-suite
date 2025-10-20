const codeWriterService = require('../services/codeWriterService');
const projectService = require('../services/projectService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const generateFiles = async (req, res, next) => {
  try {
    const { projectId, projectDir, generatedCode } = req.body;
    
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

    if (!generatedCode) {
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Generated code is required.');
    }

    const result = await codeWriterService.generateFiles(targetDirectory, generatedCode);
    logger.info(`Code generation completed for directory: ${targetDirectory}`);
    
    if (result.errors.length === 0) {
      return responseFormatter.success(res, result.message, {
        directory: targetDirectory,
        filesWritten: result.filesWritten,
        totalFiles: result.totalFiles
      });
    } else {
      return responseFormatter.error(res, 409, 'PARTIAL_SUCCESS', result.message, {
        directory: targetDirectory,
        filesWritten: result.filesWritten,
        totalFiles: result.totalFiles,
        errors: result.errors
      });
    }
  } catch (error) {
    logger.error(`Error in code generation: ${error.message}`);
    next(error);
  }
};

module.exports = {
  generateFiles
};