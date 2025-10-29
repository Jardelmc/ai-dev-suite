const fs = require('fs').promises;
const path = require('path');
const projectService = require('./projectService');
const { buildIgnoreMapForProject, shouldIgnoreEntry } = require('../utils/ignoreUtils');
const logger = require('../utils/logger');
const {
  getAllowedTextExtensions,
  getAllowedNoExtensionFiles,
} = require('../utils/fileExtensionUtil');


let allowedExtensions = [];
let allowedNoExtFiles = [];

// Initialize allowed lists asynchronously
const initializeAllowedFiles = async () => {
    try {
        allowedExtensions = await getAllowedTextExtensions();
        allowedNoExtFiles = getAllowedNoExtensionFiles();
        logger.info('Allowed text file extensions initialized/updated for metrics.');
    } catch (error) {
        logger.error(`Failed to initialize allowed text file extensions: ${error.message}`);
        // Fallback to defaults if DB read fails initially
        allowedExtensions = require("../utils/fileExtensionUtil").DEFAULT_TEXT_EXTENSIONS;
        allowedNoExtFiles = require("../utils/fileExtensionUtil").DEFAULT_NO_EXTENSION_TEXT_FILES;
    }
};
initializeAllowedFiles();
// Periodically update the allowed lists in case custom extensions change
setInterval(initializeAllowedFiles, 5 * 60 * 1000); // Update every 5 minutes

const isTextFile = (filePath) => {
  // Use the cached/updated lists
  const currentAllowedExtensions = allowedExtensions;
  const currentAllowedNoExtFiles = allowedNoExtFiles;

  const ext = path.extname(filePath).toLowerCase();
  if (!ext) {
    const fileName = path.basename(filePath).toLowerCase();
    if (!currentAllowedNoExtFiles.includes(fileName)) return false;
  } else if (!currentAllowedExtensions.includes(ext)) {
    return false;
  }
  // Basic check based on extension/name is sufficient for metrics
  return true;
};

const countLinesAndTokens = (content) => {
  if (!content) return { lines: 0, tokens: 0 };
  const lines = content.split('\n').length;
  const tokens = Math.ceil(content.length / 4); // Simple approximation
  return { lines, tokens };
};

const walkDirectory = async (dirPath, basePath, globalIgnores, projectIgnoresMap, allProjects, subProjectDirectories) => {
  let results = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (shouldIgnoreEntry(entry.name, fullPath, basePath, globalIgnores, projectIgnoresMap, allProjects)) {
        continue;
      }

      const normalizedFullPath = path.normalize(fullPath);
      const isSubProjectRoot = subProjectDirectories.some(subDir => {
        const normalizedSubDir = path.normalize(subDir);
        return normalizedFullPath === normalizedSubDir;
      });

      if (isSubProjectRoot && fullPath !== basePath) { // Exclude subproject roots unless it's the root we started with
        continue;
      }

      const relativePath = path
        .relative(basePath, fullPath)
        .replace(/\\/g, '/');

      if (entry.isDirectory()) {
        const subResults = await walkDirectory(fullPath, basePath, globalIgnores, projectIgnoresMap, allProjects, subProjectDirectories);
        results = results.concat(subResults);
      } else if (entry.isFile() && isTextFile(fullPath)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const { lines, tokens } = countLinesAndTokens(content);
          results.push({ path: relativePath, lines, tokens });
        } catch (readError) {
          // Log only if it's unexpected, maybe skip large files intentionally later
          if (readError.code !== 'ENOENT') { // Ignore if file disappeared between readdir and readFile
             logger.warn(`Could not read file for metrics ${fullPath}: ${readError.message}`);
          }
        }
      }
    }
  } catch (error) {
     if (error.code !== 'ENOENT') { // Ignore if dir disappeared
        logger.error(`Error walking directory for metrics ${dirPath}: ${error.message}`);
     }
  }
  return results;
};


const analyzeProjectMetrics = async (projectId) => {
  const rootProject = await projectService.getProjectById(projectId, true);
  if (!rootProject) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure allowed lists are up-to-date before analysis
  await initializeAllowedFiles();

  const projectsToAnalyze = [rootProject, ...(rootProject.children || [])];

  let totalTokens = 0;
  const results = [];
  const combinedDirectoryMetrics = {};

  const { globalIgnores, projectIgnoresMap, allProjects } = await buildIgnoreMapForProject(projectId);
  const allSubProjectDirectories = (rootProject.children || [])
    .map(child => child.directory)
    .filter(Boolean);

  for (const project of projectsToAnalyze) {
    if (!project.directory) {
      logger.warn(`Project ${project.title} has no directory, skipping metrics.`);
      continue;
    }

    try {
      await fs.access(project.directory);
    } catch (e) {
      logger.warn(`Directory for project ${project.title} (${project.directory}) not found, skipping metrics.`);
      continue;
    }

    // Pass the base project directory itself to walkDirectory
    const fileMetrics = await walkDirectory(
      project.directory,
      project.directory, // Base path is the project's own directory
      globalIgnores,
      projectIgnoresMap,
      allProjects,
      allSubProjectDirectories // Still exclude all subprojects when scanning the root
    );

    fileMetrics.forEach(file => {
      const dirname = path.dirname(file.path) || '.';
      // Use project title as prefix for uniqueness in combined view
      const fullDirKey = `${project.title}/${dirname}`;
      combinedDirectoryMetrics[fullDirKey] = (combinedDirectoryMetrics[fullDirKey] || 0) + 1;
    });

    const projectTotalTokens = fileMetrics.reduce((sum, file) => sum + file.tokens, 0);
    totalTokens += projectTotalTokens;

    results.push({
      projectId: project.id,
      projectTitle: project.title,
      // Format tokens for individual project display
      totalTokens: formatTokens(projectTotalTokens),
      fileMetrics: fileMetrics.sort((a, b) => b.lines - a.lines)
    });
  }

  const directoryMetricsList = Object.entries(combinedDirectoryMetrics)
    .map(([path, fileCount]) => ({ path, fileCount }))
    .sort((a, b) => b.fileCount - a.fileCount);

  // Format total tokens for the summary display
  const formattedTotalTokens = formatTokens(totalTokens);

  return {
    totalTokens: formattedTotalTokens,
    projects: results,
    directoryMetrics: directoryMetricsList
  };
};

const formatTokens = (tokens) => {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${(tokens / 1000000).toFixed(1)}M`;
};


module.exports = {
  analyzeProjectMetrics
};