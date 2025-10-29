const logger = require("../../utils/logger");
const projectService = require("../projectService");
const gitCommandService = require("./gitCommandService");

const _getProjectDirs = async (projectId, applyToSubProjects) => {
  const project = await projectService.getProjectById(
    projectId,
    applyToSubProjects
  );
  if (!project) {
    throw new Error("Project not found.");
  }

  let dirs = [project.directory];
  if (applyToSubProjects && project.children) {
    dirs = dirs.concat(project.children.map((c) => c.directory));
  }
  return dirs.filter(Boolean);
};

const createBranch = async (
  projectId,
  newBranchName,
  referenceBranch,
  applyToSubProjects
) => {
  const dirs = await _getProjectDirs(projectId, applyToSubProjects);
  const results = [];
  for (const dir of dirs) {
    try {
      if (!(await gitCommandService.isGitRepository(dir))) {
        results.push({
          directory: dir,
          success: false,
          error: "Not a git repository.",
        });
        continue;
      }
      await gitCommandService.createGitBranch(dir, newBranchName, referenceBranch);
      results.push({
        directory: dir,
        success: true,
        message: `Branch '${newBranchName}' created.`,
      });
    } catch (error) {
      results.push({ directory: dir, success: false, error: error.message });
    }
  }
  return results;
};

const mergeBranch = async (
  projectId,
  referenceBranch,
  deleteAfterMerge,
  applyToSubProjects
) => {
  const dirs = await _getProjectDirs(projectId, applyToSubProjects);
  const results = [];
  for (const dir of dirs) {
    try {
      if (!(await gitCommandService.isGitRepository(dir))) {
        results.push({
          directory: dir,
          success: false,
          error: "Not a git repository.",
        });
        continue;
      }
      const { current: branchToMerge } = await gitCommandService.getGitStatus(dir);
      const message = await gitCommandService.mergeGitBranch(dir, branchToMerge, referenceBranch, deleteAfterMerge);
      results.push({ directory: dir, success: true, message });
    } catch (error) {
      results.push({ directory: dir, success: false, error: error.message });
    }
  }
  return results;
};

const addRemoteToProject = async (
  projectId,
  applyToSubProjects,
  remoteName,
  remoteUrl
) => {
  const dirs = await _getProjectDirs(projectId, applyToSubProjects);
  const results = [];
  for (const dir of dirs) {
    try {
      if (!(await gitCommandService.isGitRepository(dir))) {
        results.push({
          directory: dir,
          success: false,
          error: "Not a git repository.",
        });
        continue;
      }
      await gitCommandService.addGitRemote(dir, remoteName, remoteUrl);
      results.push({
        directory: dir,
        success: true,
        message: `Remote '${remoteName}' added.`,
      });
    } catch (error) {
      results.push({ directory: dir, success: false, error: error.message });
    }
  }
  return results;
};

const removeRemoteFromProject = async (
  projectId,
  applyToSubProjects,
  remoteName
) => {
  const dirs = await _getProjectDirs(projectId, applyToSubProjects);
  const results = [];
  for (const dir of dirs) {
    try {
      if (!(await gitCommandService.isGitRepository(dir))) {
        results.push({
          directory: dir,
          success: false,
          error: "Not a git repository.",
        });
        continue;
      }
      await gitCommandService.removeGitRemote(dir, remoteName);
      results.push({
        directory: dir,
        success: true,
        message: `Remote '${remoteName}' removed.`,
      });
    } catch (error) {
      results.push({ directory: dir, success: false, error: error.message });
    }
  }
  return results;
};

const pushFromProject = async (projectId, applyToSubProjects, remoteName) => {
  const dirs = await _getProjectDirs(projectId, applyToSubProjects);
  const results = [];
  for (const dir of dirs) {
    try {
      if (!(await gitCommandService.isGitRepository(dir))) {
        results.push({
          directory: dir,
          success: false,
          error: "Not a git repository.",
        });
        continue;
      }
      const { current } = await gitCommandService.getGitStatus(dir);
      await gitCommandService.pushToRemote(dir, remoteName, current);
      results.push({
        directory: dir,
        success: true,
        message: `Pushed branch '${current}' to '${remoteName}'.`,
      });
    } catch (error) {
      results.push({ directory: dir, success: false, error: error.message });
    }
  }
  return results;
};

const pullToProject = async (projectId, applyToSubProjects, remoteName) => {
  const dirs = await _getProjectDirs(projectId, applyToSubProjects);
  const results = [];
  for (const dir of dirs) {
    try {
      if (!(await gitCommandService.isGitRepository(dir))) {
        results.push({
          directory: dir,
          success: false,
          error: "Not a git repository.",
        });
        continue;
      }
      const { current } = await gitCommandService.getGitStatus(dir);
      const pullResult = await gitCommandService.pullFromRemote(dir, remoteName, current);
      results.push({
        directory: dir,
        success: true,
        message: "Pull successful.",
        summary: pullResult,
      });
    } catch (error) {
      if (error.git && error.git.conflicts && error.git.conflicts.length > 0) {
        results.push({
          directory: dir,
          success: false,
          error: "Merge conflict detected.",
          conflict: true,
          summary: error.git,
        });
      } else {
        results.push({
          directory: dir,
          success: false,
          error: error.message,
          conflict: false,
        });
      }
    }
  }
  return results;
};

const checkoutBranch = async (projectId, branchName, applyToSubProjects) => {
  const dirs = await _getProjectDirs(projectId, applyToSubProjects);
  const results = [];
  for (const dir of dirs) {
    try {
      if (!(await gitCommandService.isGitRepository(dir))) {
        results.push({
          directory: dir,
          success: false,
          error: "Not a git repository.",
        });
        continue;
      }
      await gitCommandService.checkoutGitBranch(dir, branchName);
      results.push({
        directory: dir,
        success: true,
        message: `Switched to branch '${branchName}'.`,
      });
    } catch (error) {
      results.push({ directory: dir, success: false, error: error.message });
    }
  }
  return results;
};


module.exports = {
  createBranch,
  mergeBranch,
  addRemoteToProject,
  removeRemoteFromProject,
  pushFromProject,
  pullToProject,
  checkoutBranch,
};