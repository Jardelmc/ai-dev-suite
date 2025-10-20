const { exec } = require('child_process');
const fs = require('fs').promises;
const util = require('util');
const logger = require('../utils/logger');

const execPromise = util.promisify(exec);

const openInVSCode = async (directoryPath) => {
  try {
    await fs.access(directoryPath);
  } catch (error) {
    logger.error(`Directory not found: ${directoryPath}`);
    const dirError = new Error('Directory not found.');
    dirError.statusCode = 404;
    throw dirError;
  }

  const command = `code "${directoryPath}"`;
  try {
    logger.info(`Executing command: ${command}`);
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      logger.warn(`VS Code command stderr: ${stderr}`);
    }
    logger.info(`VS Code command stdout: ${stdout}`);
    return { message: `VS Code opened successfully at ${directoryPath}` };
  } catch (error) {
    logger.error(`Failed to open VS Code: ${error.message}`);
    if (error.message.includes('command not found')) {
      const cmdError = new Error('Could not open VS Code. Ensure the "code" command is in your system\'s PATH.');
      cmdError.statusCode = 500;
      throw cmdError;
    }
    const execError = new Error('An error occurred while trying to open VS Code.');
    execError.statusCode = 500;
    throw execError;
  }
};

module.exports = {
  openInVSCode,
};