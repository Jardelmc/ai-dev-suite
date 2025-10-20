const fs = require('fs').promises;
const path = require('path');
const projectService = require('./projectService');
const { buildIgnoreMapForProject, shouldIgnoreEntry } = require('../utils/ignoreUtils');
const logger = require('../utils/logger');
const { TEXT_EXTENSIONS, noExtensionTextFiles } = require('../utils/fileExtensionUtil');

const isTextFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!ext) {
    const fileName = path.basename(filePath).toLowerCase();
    if (!noExtensionTextFiles.includes(fileName)) return false;
  } else if (!TEXT_EXTENSIONS.includes(ext)) {
    return false;
  }
  return true;
};

const countLinesAndTokens = (content) => {
  if (!content) return { lines: 0, tokens: 0 };
  const lines = content.split('\n').length;
  const tokens = Math.ceil(content.length / 4);
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

      if (isSubProjectRoot) {
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
          logger.warn(`Could not read file ${fullPath}: ${readError.message}`);
        }
      }
    }
  } catch (error) {
    logger.error(`Error walking directory ${dirPath}: ${error.message}`);
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
      logger.warn(`Directory for project ${project.title} not found, skipping metrics.`);
      continue;
    }

    const subProjectDirsToExclude = project.id === rootProject.id ? allSubProjectDirectories : [];

    const fileMetrics = await walkDirectory(
      project.directory,
      project.directory,
      globalIgnores,
      projectIgnoresMap,
      allProjects,
      subProjectDirsToExclude
    );

    fileMetrics.forEach(file => {
      const dirname = path.dirname(file.path) || '.';
      const fullDirKey = `${project.title}/${dirname}`;
      combinedDirectoryMetrics[fullDirKey] = (combinedDirectoryMetrics[fullDirKey] || 0) + 1;
    });

    const projectTotalTokens = fileMetrics.reduce((sum, file) => sum + file.tokens, 0);
    totalTokens += projectTotalTokens;

    results.push({
      projectId: project.id,
      projectTitle: project.title,
      totalTokens: projectTotalTokens,
      fileMetrics: fileMetrics.sort((a, b) => b.lines - a.lines)
    });
  }

  const directoryMetricsList = Object.entries(combinedDirectoryMetrics)
    .map(([path, fileCount]) => ({ path, fileCount }))
    .sort((a, b) => b.fileCount - a.fileCount);

  const formatTokens = (tokens) => {
    if (tokens < 1000) return tokens.toString();
    return `${(tokens / 1000).toFixed(1)}K`;
  };

  return {
    totalTokens: formatTokens(totalTokens),
    projects: results,
    directoryMetrics: directoryMetricsList
  };
};

module.exports = {
  analyzeProjectMetrics
};