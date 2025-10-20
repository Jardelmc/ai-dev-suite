const projectService = require('../services/projectService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const listProjects = async (req, res, next) => {
  try {
    const { parentId } = req.query;
    const projects = parentId
      ? await projectService.getProjectsByParent(parentId)
      : await projectService.getAllProjects();
    logger.info('Projects retrieved successfully');
    return responseFormatter.success(res, 'Projects retrieved successfully', { projects });
  } catch (error) {
    logger.error(`Error listing projects: ${error.message}`);
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeChildren } = req.query;
    const project = await projectService.getProjectById(id, includeChildren === 'true');
    if (!project) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
    }
    logger.info(`Project retrieved: ${id}`);
    return responseFormatter.success(res, 'Project retrieved successfully', project);
  } catch (error) {
    logger.error(`Error getting project: ${error.message}`);
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, directory, parentId, description } = req.body;
    const newProject = await projectService.createProject({ title, directory, parentId, description });
    logger.info(`Project created: ${newProject.title}`);
    return responseFormatter.success(res, 'Project created successfully', newProject, 201);
  } catch (error) {
    logger.error(`Error creating project: ${error.message}`);
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, directory, description } = req.body;
    const updatedProject = await projectService.updateProject(id, { title, directory, description });
    if (!updatedProject) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
    }
    logger.info(`Project updated: ${id}`);
    return responseFormatter.success(res, 'Project updated successfully', updatedProject);
  } catch (error) {
    logger.error(`Error updating project: ${error.message}`);
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await projectService.deleteProject(id);
    if (!deleted) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
    }
    logger.info(`Project deleted: ${id}`);
    return responseFormatter.success(res, 'Project deleted successfully');
  } catch (error) {
    logger.error(`Error deleting project: ${error.message}`);
    next(error);
  }
};

const getProjectChildren = async (req, res, next) => {
  try {
    const { id } = req.params;
    const children = await projectService.getProjectChildren(id);
    logger.info(`Project children retrieved for: ${id}`);
    return responseFormatter.success(res, 'Project children retrieved successfully', { children });
  } catch (error) {
    logger.error(`Error getting project children: ${error.message}`);
    next(error);
  }
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectChildren
};