const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const directoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
    logger.info(`Directory exists: ${dirPath}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.info(`Directory does not exist: ${dirPath}`);
      return false;
    }
    logger.error(`Error checking directory ${dirPath}: ${error.message}`);
    throw error;
  }
};
const createDirectory = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logger.info(`Directory created: ${dirPath}`);
  } catch (error) {
    logger.error(`Error creating directory ${dirPath}: ${error.message}`);
    throw error;
  }
};
const createFile = async (filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    logger.info(`File created: ${filePath}`);
  } catch (error) {
    logger.error(`Error creating file ${filePath}: ${error.message}`);
    throw error;
  }
};
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    logger.info(`File exists: ${filePath}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.info(`File does not exist: ${filePath}`);
      return false;
    }
    logger.error(`Error checking file ${filePath}: ${error.message}`);
    throw error;
  }
};
const readFileContent = async (filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        logger.info(`File content read: ${filePath}`);
        return content;
    } catch (error) {
        logger.error(`Error reading file ${filePath}: ${error.message}`);
        throw error;
    }
};

const appendToFile = async (filePath, content) => {
    try {
        await fs.appendFile(filePath, content, 'utf8');
        logger.info(`Content appended to file: ${filePath}`);
    } catch (error) {
        logger.error(`Error appending to file ${filePath}: ${error.message}`);
        throw error;
    }
};

module.exports = {
  directoryExists,
  createDirectory,
  createFile,
  fileExists,
  readFileContent,
  appendToFile,
};