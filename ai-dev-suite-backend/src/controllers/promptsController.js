const promptService = require('../services/promptService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const listPrompts = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const prompts = categoryId 
      ? await promptService.getPromptsByCategory(categoryId)
      : await promptService.getAllPrompts();
    logger.info('Prompts retrieved successfully');
    return responseFormatter.success(res, 'Prompts retrieved successfully', { prompts });
  } catch (error) {
    logger.error(`Error listing prompts: ${error.message}`);
    next(error);
  }
};

const getPrompt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prompt = await promptService.getPromptById(id);
    if (!prompt) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Prompt not found.');
    }
    logger.info(`Prompt retrieved: ${id}`);
    return responseFormatter.success(res, 'Prompt retrieved successfully', prompt);
  } catch (error) {
    logger.error(`Error getting prompt: ${error.message}`);
    next(error);
  }
};

const createPrompt = async (req, res, next) => {
  try {
    const { title, content, categoryId, tags, description } = req.body;
    const newPrompt = await promptService.createPrompt({ title, content, categoryId, tags, description });
    logger.info(`Prompt created: ${newPrompt.title}`);
    return responseFormatter.success(res, 'Prompt created successfully', newPrompt, 201);
  } catch (error) {
    logger.error(`Error creating prompt: ${error.message}`);
    next(error);
  }
};

const updatePrompt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, tags, description } = req.body;
    const updatedPrompt = await promptService.updatePrompt(id, { title, content, categoryId, tags, description });
    if (!updatedPrompt) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Prompt not found.');
    }
    logger.info(`Prompt updated: ${id}`);
    return responseFormatter.success(res, 'Prompt updated successfully', updatedPrompt);
  } catch (error) {
    logger.error(`Error updating prompt: ${error.message}`);
    next(error);
  }
};

const deletePrompt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await promptService.deletePrompt(id);
    if (!deleted) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Prompt not found.');
    }
    logger.info(`Prompt deleted: ${id}`);
    return responseFormatter.success(res, 'Prompt deleted successfully');
  } catch (error) {
    logger.error(`Error deleting prompt: ${error.message}`);
    next(error);
  }
};

module.exports = {
  listPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt
};