const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const generateFiles = async (projectDir, generatedCode) => {
  const fileRegex = /\[FILEPATH:([^\]]+)\]([\s\S]*?)\[\/FILEPATH\]/g;
  let match;
  const filesToWrite = [];

  while ((match = fileRegex.exec(generatedCode)) !== null) {
    const relativePath = match[1].trim();
    const content = match[2].trim();
    if (relativePath) {
      filesToWrite.push({ relativePath, content });
    }
  }

  if (filesToWrite.length === 0) {
    throw new Error('No valid [FILEPATH:...][/FILEPATH] blocks found in generated code.');
  }

  let filesWritten = 0;
  const errors = [];

  for (const fileInfo of filesToWrite) {
    const absolutePath = path.resolve(projectDir, fileInfo.relativePath);
    const dirName = path.dirname(absolutePath);

    if (!absolutePath.startsWith(path.resolve(projectDir))) {
      errors.push(`Attempt to write outside base directory detected: ${fileInfo.relativePath}`);
      continue;
    }

    try {
      await fs.mkdir(dirName, { recursive: true });
    } catch (mkdirError) {
      if (mkdirError.code !== 'EEXIST') {
        errors.push(`Error creating directory ${dirName}: ${mkdirError.message}`);
        continue;
      }
    }

    try {
      await fs.writeFile(absolutePath, fileInfo.content);
      filesWritten++;
      logger.info(`File written: ${fileInfo.relativePath}`);
    } catch (writeFileError) {
      errors.push(`Error writing file ${fileInfo.relativePath}: ${writeFileError.message}`);
    }
  }

  const message = errors.length === 0
    ? `Success! ${filesWritten} file(s) were written/updated in ${projectDir}`
    : `Process completed with ${errors.length} error(s). ${filesWritten} file(s) written successfully. Errors: ${errors.join('; ')}`;

  return {
    message,
    filesWritten,
    totalFiles: filesToWrite.length,
    errors
  };
};

module.exports = {
  generateFiles
};