const customExtensionsService = require('../services/customExtensionsService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const listCustomExtensions = async (req, res, next) => {
  try {
    const customExtensions = await customExtensionsService.getAllCustomExtensions();
    logger.info('Custom text extensions retrieved successfully');
    return responseFormatter.success(res, 'Custom text extensions retrieved successfully', { customExtensions });
  } catch (error) {
    logger.error(`Error listing custom extensions: ${error.message}`);
    next(error);
  }
};

const listDefaultExtensions = (req, res, next) => {
    try {
        const defaultExtensions = customExtensionsService.getDefaultExtensions();
        logger.info('Default text extensions retrieved successfully');
        return responseFormatter.success(res, 'Default text extensions retrieved successfully', defaultExtensions);
    } catch (error) {
        // Should not happen as it reads constants, but for safety
        logger.error(`Error listing default extensions: ${error.message}`);
        next(error);
    }
};


const addCustomExtension = async (req, res, next) => {
  try {
    const { extension } = req.body;
    const newExtension = await customExtensionsService.createCustomExtension(extension);
    logger.info(`Custom text extension created: ${newExtension.extension}`);
    return responseFormatter.success(res, 'Custom text extension created successfully', newExtension, 201);
  } catch (error) {
    logger.error(`Error creating custom extension: ${error.message}`);
    // Handle specific errors like duplicate entry
    if (error.message.includes("already exists") || error.message.includes("included by default")) {
         return responseFormatter.error(res, 409, 'CONFLICT', error.message);
    }
     if (error.message.includes("Invalid extension format")) {
         return responseFormatter.error(res, 400, 'VALIDATION_ERROR', error.message);
    }
    next(error);
  }
};

const removeCustomExtension = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await customExtensionsService.deleteCustomExtension(id);
    if (!deleted) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Custom text extension not found.');
    }
    logger.info(`Custom text extension deleted: ${id}`);
    return responseFormatter.success(res, 'Custom text extension deleted successfully');
  } catch (error) {
    logger.error(`Error deleting custom extension: ${error.message}`);
    next(error);
  }
};

module.exports = {
  listCustomExtensions,
  addCustomExtension,
  removeCustomExtension,
  listDefaultExtensions,
};