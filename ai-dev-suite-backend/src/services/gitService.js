const simpleGit = require('simple-git');
const path = require('path');
const fileService = require('./fileService');
const logger = require('../utils/logger');
const projectService = require('./projectService');

const gitOptions = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6
};

const createGitignore = async (projectDir) => {
  const gitignorePath = path.join(projectDir, '.gitignore');
  const content = 'node_modules/\n.env\n*.log\n';
  await fileService.createFile(gitignorePath, content);
  logger.info(`.gitignore created in ${projectDir}`);
};

const createGitignoreIfNotExists = async (projectDir) => {
  const gitignorePath = path.join(projectDir, '.gitignore');
  const exists = await fileService.fileExists(gitignorePath);
  if (!exists) {
    await createGitignore(projectDir);
  } else {
    logger.info(`.gitignore already exists in ${projectDir}`);
  }
};

const initializeGit = async (projectDir) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  try {
    await git.init();
    logger.info(`Git repository initialized in ${projectDir}`);
  } catch (error) {
    logger.error(`Error initializing Git in ${projectDir}: ${error.message}`);
    throw error;
  }
};

const isGitRepository = async (projectDir) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  try {
    const isRepo = await git.checkIsRepo();
    logger.info(`Is Git repository check for ${projectDir}: ${isRepo}`);
    return isRepo;
  } catch (error) {
    logger.error(`Error checking if ${projectDir} is a Git repository: ${error.message}`);
    return false;
  }
};

const commitChanges = async (projectDir, message) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  try {
    await git.add('./*');
    const status = await git.status();
    if (status.files.length > 0 || status.staged.length > 0) {
      await git.commit(message);
      logger.info(`Changes committed in ${projectDir} with message: "${message}"`);
      return true;
    } else {
      logger.info(`No changes to commit in ${projectDir}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error committing changes in ${projectDir}: ${error.message}`);
    throw error;
  }
};

const processCommit = async (projectDir, commitMessage = 'Initial commit via API') => {
  const dirExists = await fileService.directoryExists(projectDir);
  let gitInitialized = false;
  let commitPerformed = false;

  if (!dirExists) {
    await fileService.createDirectory(projectDir);
    await createGitignore(projectDir);
    await initializeGit(projectDir);
    gitInitialized = true;
    commitPerformed = await commitChanges(projectDir, 'Initial commit via API');
  } else {
    const isGit = await isGitRepository(projectDir);
    if (!isGit) {
      await createGitignoreIfNotExists(projectDir);
      await initializeGit(projectDir);
      gitInitialized = true;
      commitPerformed = await commitChanges(projectDir, 'Initial commit via API');
    } else {
      await createGitignoreIfNotExists(projectDir);
      commitPerformed = await commitChanges(projectDir, commitMessage);
    }
  }

  return {
    directory: projectDir,
    gitInitialized: gitInitialized,
    commitPerformed: commitPerformed,
    message: commitPerformed
      ? `Commit successful: ${commitMessage}`
      : 'No changes to commit.'
  };
};

const revertChanges = async (projectDir) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  try {
    logger.warn(`Performing hard reset and clean on: ${projectDir}`);
    await git.reset(['--hard', 'HEAD']);
    logger.info(`Hard reset completed for ${projectDir}.`);
    await git.clean('f', ['-d']);
    logger.info(`Clean completed for ${projectDir}.`);
    return { message: 'Repository successfully reverted to the last commit.' };
  } catch (error) {
    logger.error(`Error during revert process in ${projectDir}: ${error.message}`);
    throw new Error('Failed to revert changes.');
  }
};

const getProjectStatus = async (projectDir) => {
    const git = simpleGit({ ...gitOptions, baseDir: projectDir });
    const isRepo = await isGitRepository(projectDir);

    if (!isRepo) {
        return { isRepo: false, files: [], totalChanges: 0 };
    }

    const status = await git.status();
    const totalChanges = status.files.length;
    return {
        isRepo: true,
        files: status.files,
        totalChanges,
    };
};

const getGitStatusForProject = async (projectId) => {
    const project = await projectService.getProjectById(projectId, true);
    if (!project) {
        throw new Error('Project not found');
    }

    const statusResults = [];
    const rootIsDirExists = await fileService.directoryExists(project.directory);

    if (rootIsDirExists) {
        const rootStatus = await getProjectStatus(project.directory);
        statusResults.push({
            projectId: project.id,
            projectTitle: project.title,
            isDirectory: true,
            ...rootStatus,
        });
    } else {
         statusResults.push({
            projectId: project.id,
            projectTitle: project.title,
            isDirectory: false,
            isRepo: false,
            files: [],
            totalChanges: 0
        });
    }

    if (project.children && project.children.length > 0) {
        for (const child of project.children) {
            const childDirExists = await fileService.directoryExists(child.directory);
             if (childDirExists) {
                const childStatus = await getProjectStatus(child.directory);
                statusResults.push({
                    projectId: child.id,
                    projectTitle: child.title,
                    isDirectory: true,
                    ...childStatus,
                });
            } else {
                statusResults.push({
                    projectId: child.id,
                    projectTitle: child.title,
                    isDirectory: false,
                    isRepo: false,
                    files: [],
                    totalChanges: 0
                });
            }
        }
    }

    return statusResults;
};

module.exports = {
  processCommit,
  revertChanges,
  initializeGit,
  isGitRepository,
  commitChanges,
  createGitignore,
  createGitignoreIfNotExists,
  getGitStatusForProject,
};