const gitService = require('../services/gitService');
const gitProjectService = require('../services/git/gitProjectService');
const gitDbService = require('../services/git/gitDbService');
const projectService = require('../services/projectService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const commitChanges = async (req, res, next) => {
  try {
    const { projectId, projectDir, commitMessage } = req.body;
    let targetDirectory = projectDir;

    if (projectId) {
      const project = await projectService.getProjectById(projectId);
      if (!project) {
        return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
      }
      if (!project.directory) {
        return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project does not have a directory configured.');
      }
      targetDirectory = project.directory;
    }

    if (!targetDirectory) {
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project directory or projectId with configured directory is required.');
    }

    const result = await gitService.processCommit(targetDirectory, commitMessage);
    logger.info(`Git commit processed for directory: ${targetDirectory}`);
    return responseFormatter.success(res, result.message, result);
  } catch (error) {
    logger.error(`Error in git commit: ${error.message}`);
    next(error);
  }
};

const revertChanges = async (req, res, next) => {
  try {
    const { projectId, projectDir } = req.body;
    let targetDirectory = projectDir;

    if (projectId) {
      const project = await projectService.getProjectById(projectId);
      if (!project) {
        return responseFormatter.error(res, 404, 'NOT_FOUND', 'Project not found.');
      }
      if (!project.directory) {
        return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project does not have a directory configured.');
      }
      targetDirectory = project.directory;
    }

    if (!targetDirectory) {
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', 'Project directory or projectId with configured directory is required.');
    }

    const result = await gitService.revertChanges(targetDirectory);
    logger.info(`Git revert processed for directory: ${targetDirectory}`);
    return responseFormatter.success(res, result.message, { directory: targetDirectory });
  } catch (error) {
    logger.error(`Error in git revert: ${error.message}`);
    next(error);
  }
};

const getStatus = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const status = await gitService.getGitStatusForProject(projectId);
        logger.info(`Git status retrieved for project: ${projectId}`);
        return responseFormatter.success(res, 'Git status retrieved successfully', status);
    } catch (error) {
        logger.error(`Error in git status: ${error.message}`);
        next(error);
    }
};

const createBranch = async (req, res, next) => {
    try {
        const { projectId, newBranchName, referenceBranch, applyToSubProjects } = req.body;
        const result = await gitProjectService.createBranch(projectId, newBranchName, referenceBranch, applyToSubProjects);
        logger.info(`Git create branch processed for project: ${projectId}`);
        return responseFormatter.success(res, 'Branch creation process completed.', result);
    } catch (error) {
        logger.error(`Error in git create branch: ${error.message}`);
        next(error);
    }
};

const mergeBranch = async (req, res, next) => {
    try {
        const { projectId, referenceBranch, deleteAfterMerge, applyToSubProjects } = req.body;
        const result = await gitProjectService.mergeBranch(projectId, referenceBranch, deleteAfterMerge, applyToSubProjects);
        logger.info(`Git merge branch processed for project: ${projectId}`);
        return responseFormatter.success(res, 'Branch merge process completed.', result);
    } catch (error) {
        logger.error(`Error in git merge branch: ${error.message}`);
        next(error);
    }
};

const getProjectReferenceBranch = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await gitDbService.getProjectReferenceBranch(projectId);
        logger.info(`Reference branch retrieved for project: ${projectId}`);
        return responseFormatter.success(res, 'Reference branch retrieved successfully.', result);
    } catch (error) {
        logger.error(`Error getting reference branch: ${error.message}`);
        next(error);
    }
};

const setProjectReferenceBranch = async (req, res, next) => {
    try {
        const { projectId, branchName, applyToSubProjects } = req.body;
        const result = await gitDbService.setProjectReferenceBranch(projectId, branchName, applyToSubProjects);
        logger.info(`Reference branch updated for project: ${projectId}`);
        return responseFormatter.success(res, 'Reference branch updated and checked out successfully.', result);
    } catch (error) {
        logger.error(`Error setting reference branch: ${error.message}`);
        next(error);
    }
};

const initRepository = async (req, res, next) => {
    try {
        const { projectId } = req.body;
        const result = await gitService.initializeRepositoryForProject(projectId);
        logger.info(`Git repository initialized for project: ${projectId}`);
        return responseFormatter.success(res, result.message, result);
    } catch (error) {
        logger.error(`Error in git init: ${error.message}`);
        next(error);
    }
};

const getRemotes = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await gitService.getRemotesForProject(projectId);
        logger.info(`Remotes retrieved for project: ${projectId}`);
        return responseFormatter.success(res, 'Remotes retrieved successfully.', result);
    } catch (error) {
        logger.error(`Error getting remotes: ${error.message}`);
        next(error);
    }
};

const addRemote = async (req, res, next) => {
    try {
        const { projectId, applyToSubProjects, remoteName, remoteUrl } = req.body;
        const result = await gitProjectService.addRemoteToProject(projectId, applyToSubProjects, remoteName, remoteUrl);
        logger.info(`Add remote processed for project: ${projectId}`);
        return responseFormatter.success(res, 'Add remote process completed.', result);
    } catch (error) {
        logger.error(`Error adding remote: ${error.message}`);
        next(error);
    }
};

const removeRemote = async (req, res, next) => {
    try {
        const { projectId, applyToSubProjects, remoteName } = req.body;
        const result = await gitProjectService.removeRemoteFromProject(projectId, applyToSubProjects, remoteName);
        logger.info(`Remove remote processed for project: ${projectId}`);
        return responseFormatter.success(res, 'Remove remote process completed.', result);
    } catch (error) {
        logger.error(`Error removing remote: ${error.message}`);
        next(error);
    }
};

const push = async (req, res, next) => {
    try {
        const { projectId, applyToSubProjects, remoteName } = req.body;
        const result = await gitProjectService.pushFromProject(projectId, applyToSubProjects, remoteName);
        logger.info(`Push processed for project: ${projectId}`);
        return responseFormatter.success(res, 'Push process completed.', result);
    } catch (error) {
        logger.error(`Error during push: ${error.message}`);
        next(error);
    }
};

const pull = async (req, res, next) => {
    try {
        const { projectId, applyToSubProjects, remoteName } = req.body;
        const result = await gitProjectService.pullToProject(projectId, applyToSubProjects, remoteName);
        logger.info(`Pull processed for project: ${projectId}`);
        return responseFormatter.success(res, 'Pull process completed.', result);
    } catch (error) {
        logger.error(`Error during pull: ${error.message}`);
        next(error);
    }
};

const getRemoteStatus = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await gitService.getRemoteStatus(projectId);
        logger.info(`Remote status retrieved for project: ${projectId}`);
        return responseFormatter.success(res, 'Remote status retrieved successfully.', result);
    } catch (error) {
        logger.error(`Error getting remote status: ${error.message}`);
        next(error);
    }
};

const cloneRepository = async (req, res, next) => {
    try {
        const { parentId, repositoryUrl, projectName, directory } = req.body;
        const result = await gitService.cloneAndSetupSubProject(parentId, repositoryUrl, projectName, directory);
        logger.info(`Repository cloned and sub-project created for URL: ${repositoryUrl}`);
        return responseFormatter.success(res, 'Repository cloned and sub-project created successfully.', result);
    } catch (error) {
        logger.error(`Error in cloneRepository controller: ${error.message}`);
        next(error);
    }
};

const getLocalBranches = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const branches = await gitService.getLocalBranches(projectId);
        logger.info(`Local branches retrieved for project: ${projectId}`);
        return responseFormatter.success(res, 'Local branches retrieved successfully.', { branches });
    } catch (error) {
        logger.error(`Error getting local branches: ${error.message}`);
        next(error);
    }
};

const checkoutBranch = async (req, res, next) => {
    try {
        const { projectId, branchName, applyToSubProjects } = req.body;
        const result = await gitProjectService.checkoutBranch(projectId, branchName, applyToSubProjects);
        logger.info(`Checkout branch processed for project: ${projectId}`);
        return responseFormatter.success(res, 'Checkout branch process completed.', result);
    } catch (error) {
        logger.error(`Error checking out branch: ${error.message}`);
        next(error);
    }
};

module.exports = {
  commitChanges,
  revertChanges,
  getStatus,
  createBranch,
  mergeBranch,
  getProjectReferenceBranch,
  setProjectReferenceBranch,
  initRepository,
  getRemotes,
  addRemote,
  removeRemote,
  push,
  pull,
  getRemoteStatus,
  cloneRepository,
  getLocalBranches,
  checkoutBranch,
};