const templateService = require('../services/templateService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const listTemplates = async (req, res, next) => {
  try {
    const templates = await templateService.getAllTemplates();
    logger.info('Templates retrieved successfully');
    return responseFormatter.success(res, 'Templates retrieved successfully', { templates });
  } catch (error) {
    logger.error(`Error listing templates: ${error.message}`);
    next(error);
  }
};

const getTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await templateService.getTemplateById(id);
    if (!template) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Template not found.');
    }
    logger.info(`Template retrieved: ${id}`);
    return responseFormatter.success(res, 'Template retrieved successfully', template);
  } catch (error) {
    logger.error(`Error getting template: ${error.message}`);
    next(error);
  }
};

const createTemplate = async (req, res, next) => {
  try {
    const { name, description, type, content } = req.body;
    const newTemplate = await templateService.createTemplate({ name, description, type, content });
    logger.info(`Template created: ${newTemplate.name}`);
    return responseFormatter.success(res, 'Template created successfully', newTemplate, 201);
  } catch (error) {
    logger.error(`Error creating template: ${error.message}`);
    next(error);
  }
};

const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, type, content } = req.body;
    const updatedTemplate = await templateService.updateTemplate(id, { name, description, type, content });
    if (!updatedTemplate) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Template not found.');
    }
    logger.info(`Template updated: ${id}`);
    return responseFormatter.success(res, 'Template updated successfully', updatedTemplate);
  } catch (error) {
    logger.error(`Error updating template: ${error.message}`);
    next(error);
  }
};

const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await templateService.deleteTemplate(id);
    if (!deleted) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Template not found.');
    }
    logger.info(`Template deleted: ${id}`);
    return responseFormatter.success(res, 'Template deleted successfully');
  } catch (error) {
    logger.error(`Error deleting template: ${error.message}`);
    next(error);
  }
};

module.exports = {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate
};