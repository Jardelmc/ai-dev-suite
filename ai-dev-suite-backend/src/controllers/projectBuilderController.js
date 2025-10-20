const projectBuilderService = require('../services/projectBuilderService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const buildProject = async (req, res, next) => {
  try {
    const { rootProject, subProjects } = req.body;
    const result = await projectBuilderService.createProject(rootProject, subProjects);
    logger.info(`Project built successfully: ${rootProject.name}`);
    return responseFormatter.success(res, 'Project built successfully', result, 201);
  } catch (error) {
    logger.error(`Error building project: ${error.message}`);
    next(error);
  }
};

const generatePrompt = async (req, res, next) => {
  try {
    const { projectId, functionalities } = req.body;
    const prompt = await projectBuilderService.generateSolutionPrompt(projectId, functionalities);
    logger.info(`Solution prompt generated for project ID: ${projectId}`);
    return responseFormatter.success(res, 'Prompt generated successfully', { prompt });
  } catch (error) {
    logger.error(`Error generating prompt: ${error.message}`);
    next(error);
  }
};

module.exports = {
  buildProject,
  generatePrompt,
};