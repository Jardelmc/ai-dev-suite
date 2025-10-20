const { exec } = require("child_process");
const fs = require("fs").promises;
const util = require("util");
const logger = require("../utils/logger");
const execPromise = util.promisify(exec);

const openInExplorer = async (directoryPath) => {
  try {
    await fs.access(directoryPath);
  } catch (error) {
    logger.error(`Directory not found: ${directoryPath}`);
    const dirError = new Error("Directory not found.");
    dirError.statusCode = 404;
    throw dirError;
  }

  let command;
  switch (process.platform) {
    case "win32":
      command = `explorer "${directoryPath}"`;
      break;
    case "darwin":
      command = `open "${directoryPath}"`;
      break;
    default:
      command = `xdg-open "${directoryPath}"`;
      break;
  }

  try {
    logger.info(`Executing command: ${command}`);
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      logger.warn(`Explorer command stderr: ${stderr}`);
    }
    logger.info(`Explorer command stdout: ${stdout}`);
    return { message: `Explorer opened successfully at ${directoryPath}` };
  } catch (error) {
    // On Windows, the 'explorer' command can throw an error even if it succeeds.
    // We check the platform and if an error is caught, we assume it worked as expected.
    if (process.platform === "win32") {
      return { message: `Explorer opened successfully at ${directoryPath}` };
    }

    // For other platforms, the error is likely real.
    logger.error(`Failed to open explorer: ${error.message}`);
    const execError = new Error(
      "An error occurred while trying to open the file explorer."
    );
    execError.statusCode = 500;
    throw execError;
  }
};

module.exports = {
  openInExplorer,
};
