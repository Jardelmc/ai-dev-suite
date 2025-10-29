const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const logger = require("../utils/logger");
const {
  buildIgnoreMapForProject,
  shouldIgnoreEntry,
} = require("../utils/ignoreUtils");
const {
  getAllowedTextExtensions,
  getAllowedNoExtensionFiles,
} = require("../utils/fileExtensionUtil");

let allowedExtensions = [];
let allowedNoExtFiles = [];

// Initialize allowed lists asynchronously
const initializeAllowedFiles = async () => {
  try {
    allowedExtensions = await getAllowedTextExtensions();
    allowedNoExtFiles = getAllowedNoExtensionFiles();
    logger.info(
      "Allowed text file extensions initialized/updated for analyzer."
    );
  } catch (error) {
    logger.error(
      `Failed to initialize allowed text file extensions: ${error.message}`
    );
    // Fallback to defaults if DB read fails initially
    allowedExtensions =
      require("../utils/fileExtensionUtil").DEFAULT_TEXT_EXTENSIONS;
    allowedNoExtFiles =
      require("../utils/fileExtensionUtil").DEFAULT_NO_EXTENSION_TEXT_FILES;
  }
};
initializeAllowedFiles();
// Periodically update the allowed lists in case custom extensions change
setInterval(initializeAllowedFiles, 2 * 60 * 1000); // Update every 2 minutes

const isTextFile = (filePath) => {
  // Use the cached/updated lists
  const currentAllowedExtensions = allowedExtensions;
  const currentAllowedNoExtFiles = allowedNoExtFiles;

  const fileName = path.basename(filePath);
  if (fileName === ".env" || fileName.startsWith(".env.")) {
    return true;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!ext) {
    const baseName = path.basename(filePath).toLowerCase();
    if (!currentAllowedNoExtFiles.includes(baseName)) return false;
  } else if (!currentAllowedExtensions.includes(ext)) {
    return false;
  }

  try {
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(1024);
    const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
    fs.closeSync(fd);

    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) return false;
      if (buffer[i] > 127) {
        const remainingBytes = bytesRead - i;
        if (remainingBytes < 3) continue;

        const byte1 = buffer[i];
        const byte2 = buffer[i + 1];
        const byte3 = buffer[i + 2];

        if ((byte1 & 0xe0) === 0xc0 && (byte2 & 0xc0) === 0x80) {
          i += 1;
        } else if (
          (byte1 & 0xf0) === 0xe0 &&
          (byte2 & 0xc0) === 0x80 &&
          (byte3 & 0xc0) === 0x80
        ) {
          i += 2;
        } else if ((byte1 & 0xf8) === 0xf0 && remainingBytes >= 4) {
          const byte4 = buffer[i + 3];
          if (
            (byte2 & 0xc0) === 0x80 &&
            (byte3 & 0xc0) === 0x80 &&
            (byte4 & 0xc0) === 0x80
          ) {
            i += 3;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    // Log error but treat as non-text if reading fails
    logger.warn(
      `Could not verify if ${filePath} is a text file: ${error.message}`
    );
    return false;
  }
};

const readDirectoryRecursive = (
  dirPath,
  basePath,
  globalIgnores,
  projectIgnoresMap,
  allProjects,
  excludedProjectDirs,
  prefix = "",
  level = 0
) => {
  let treeString = "";
  const filePaths = [];
  let fileContents = "";

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const filteredEntries = entries.filter((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory() && excludedProjectDirs.includes(fullPath)) {
        return false;
      }
      return !shouldIgnoreEntry(
        entry.name,
        fullPath,
        basePath,
        globalIgnores,
        projectIgnoresMap,
        allProjects
      );
    });

    filteredEntries.forEach((entry, index) => {
      const isLast = index === filteredEntries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      treeString += `${prefix}${connector}${entry.name}\n`;

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const {
          tree: subTree,
          paths: subPaths,
          contents: subContents,
        } = readDirectoryRecursive(
          fullPath,
          basePath,
          globalIgnores,
          projectIgnoresMap,
          allProjects,
          excludedProjectDirs,
          newPrefix,
          level + 1
        );
        treeString += subTree;
        filePaths.push(...subPaths);
        fileContents += subContents;
      } else if (entry.isFile()) {
        filePaths.push(fullPath);

        if (isTextFile(fullPath)) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            const relativePath = path
              .relative(basePath, fullPath)
              .replace(/\\/g, "/");
            fileContents += `[FILEPATH:${relativePath}]\n${content}\n[/FILEPATH]\n\n`;
          } catch (readError) {
            const relativePath = path
              .relative(basePath, fullPath)
              .replace(/\\/g, "/");
            fileContents += `[FILEPATH:${relativePath}]\n<error reading file: ${readError.message}>\n[/FILEPATH]\n\n`;
            logger.error(
              `Error reading file ${fullPath}: ${readError.message}`
            );
          }
        } else {
          const relativePath = path
            .relative(basePath, fullPath)
            .replace(/\\/g, "/");
          fileContents += `[FILEPATH:${relativePath}]\nBinary file - content not displayed\n[/FILEPATH]\n\n`;
        }
      }
    });
  } catch (error) {
    logger.error(`Error reading directory ${dirPath}: ${error.message}`);
    error.message = `Failed to read directory ${path.basename(dirPath)}: ${
      error.message
    }`;
    throw error;
  }

  return { tree: treeString, paths: filePaths, contents: fileContents };
};

const analyzeProject = async (
  absoluteDirPath,
  projectId,
  excludedSubprojectIds = []
) => {
  if (!fs.existsSync(absoluteDirPath)) {
    const error = new Error(`Directory not found: ${absoluteDirPath}`);
    error.statusCode = 404;
    error.code = "ENOENT";
    throw error;
  }

  try {
    const stats = fs.statSync(absoluteDirPath);
    if (!stats.isDirectory()) {
      const error = new Error(`Path is not a directory: ${absoluteDirPath}`);
      error.statusCode = 400;
      throw error;
    }
  } catch (statError) {
    const error = new Error(
      `Cannot access path information: ${absoluteDirPath}. Reason: ${statError.message}`
    );
    error.statusCode = statError.code === "EACCES" ? 403 : 500;
    error.code = statError.code;
    throw error;
  }

  // Ensure allowed lists are up-to-date before analysis
  await initializeAllowedFiles();

  let tempFilePath;
  try {
    const { globalIgnores, projectIgnoresMap, allProjects } =
      await buildIgnoreMapForProject(projectId);
    const excludedProjectDirs = allProjects
      .filter((p) => excludedSubprojectIds.includes(p.id))
      .map((p) => p.directory);

    const rootDirName = path.basename(absoluteDirPath);
    const { tree, contents } = readDirectoryRecursive(
      absoluteDirPath,
      absoluteDirPath,
      globalIgnores,
      projectIgnoresMap,
      allProjects,
      excludedProjectDirs
    );
    const projectContent = `${rootDirName}\n${tree}\n${contents}`.trimEnd();

    const tempFileName = `analyzer-${crypto
      .randomBytes(16)
      .toString("hex")}.txt`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);

    fs.writeFileSync(tempFilePath, projectContent, "utf8");

    const fileBuffer = fs.readFileSync(tempFilePath);
    const base64 = fileBuffer.toString("base64");

    return { projectContent, base64 };
  } catch (error) {
    logger.error("Error during project analysis:", error);
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        logger.error(
          `Error deleting temporary file ${tempFilePath}: ${unlinkError.message}`
        );
      }
    }
  }
};

module.exports = {
  analyzeProject,
};
