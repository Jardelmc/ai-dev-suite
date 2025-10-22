const promptService = require('../services/promptService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const fs = require('fs').promises;

const listPrompts = async (req, res, next) => {
  try {
    const { categoryId, tags } = req.query;
    let prompts;
    if (categoryId) {
      prompts = await promptService.getPromptsByCategory(categoryId);
    } else {
      prompts = await promptService.getAllPrompts();
    }
    // TODO: Implement tag filtering if needed
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

const exportPrompts = async (req, res, next) => {
    try {
        const exportData = await promptService.exportPrompts();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `prompts_export_all_${timestamp}.json`; // More specific filename

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/json');
        logger.info(`Exporting all prompts to ${fileName}`);
        res.status(200).json(exportData);
    } catch (error) {
        logger.error(`Error exporting prompts: ${error.message}`);
        next(error);
    }
};

const exportPromptById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const exportData = await promptService.exportPromptById(id);

        // Sanitize title for filename
        const promptTitle = exportData.prompts[0]?.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) || 'prompt';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `prompt_export_${promptTitle}_${timestamp}.json`;

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/json');
        logger.info(`Exporting prompt ${id} to ${fileName}`);
        res.status(200).json(exportData);
    } catch (error) {
        if (error.message === 'Prompt not found.') {
             logger.warn(`Attempted to export non-existent prompt: ${req.params.id}`);
             return responseFormatter.error(res, 404, 'NOT_FOUND', 'Prompt not found.');
        }
        logger.error(`Error exporting prompt by ID: ${error.message}`);
        next(error);
    }
};


const importPrompts = async (req, res, next) => {
    if (!req.file) {
      return responseFormatter.error(res, 400, 'BAD_REQUEST', 'No import file uploaded.');
    }

    try {
        const fileContent = await fs.readFile(req.file.path, 'utf8');
        const importData = JSON.parse(fileContent);

        // Basic validation
        if (!importData || !Array.isArray(importData.prompts) || !Array.isArray(importData.categories)) {
             await fs.unlink(req.file.path); // Clean up temp file
             return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Invalid import file format. Missing prompts or categories array.');
        }

        const result = await promptService.importPrompts(importData);
        await fs.unlink(req.file.path); // Clean up temp file

        logger.info(`Import process finished for file: ${req.file.originalname}`);
        return responseFormatter.success(res, result.message, result);
    } catch (error) {
        if (req.file && req.file.path) {
             try { await fs.unlink(req.file.path); } catch (unlinkErr) { logger.error(`Failed to delete temp import file: ${unlinkErr.message}`); }
        }
        if (error instanceof SyntaxError) {
            logger.error(`Error importing prompts: Invalid JSON file.`);
            return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Invalid JSON file format.');
        }
        logger.error(`Error importing prompts: ${error.message}`);
        next(error);
    }
};


module.exports = {
  listPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  exportPrompts,
  exportPromptById, // Add new controller
  importPrompts,
};