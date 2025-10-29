const path = require("path");
const fileService = require("./fileService");
const logger = require("../utils/logger");
const projectService = require("./projectService");
const gitCommandService = require("./git/gitCommandService");
const gitignoreService = require("./git/gitignoreService");
const gitDbService = require("./git/gitDbService");
const gitProjectService = require("./git/gitProjectService");

const initializeRepositoryForProject = async (projectId) => {
  const project = await projectService.getProjectById(projectId);
  if (!project || !project.directory) {
    throw new Error("Project not found or has no directory configured.");
  }

  if (await gitCommandService.isGitRepository(project.directory)) {
    throw new Error("Project is already a Git repository.");
  }

  await gitignoreService.manageRootGitignoreForNewRepo(project.directory);
  await gitCommandService.initializeGit(project.directory);
  await gitCommandService.commitChanges(project.directory, "Initial commit");
  logger.info(
    `Successfully initialized and committed for project: ${project.title}`
  );
  return {
    message: `Repository for '${project.title}' initialized successfully.`,
  };
};

const processCommit = async (
  projectDir,
  commitMessage = "Initial commit via API"
) => {
  const dirExists = await fileService.directoryExists(projectDir);
  let gitInitialized = false;
  let commitPerformed = false;

  if (!dirExists) {
    await fileService.createDirectory(projectDir);
    await gitignoreService.manageRootGitignoreForNewRepo(projectDir);
    await gitCommandService.initializeGit(projectDir);
    gitInitialized = true;
    commitPerformed = await gitCommandService.commitChanges(projectDir, "Initial commit via API");
  } else {
    const isGit = await gitCommandService.isGitRepository(projectDir);
    if (!isGit) {
      await gitignoreService.manageRootGitignoreForNewRepo(projectDir);
      await gitCommandService.initializeGit(projectDir);
      gitInitialized = true;
      commitPerformed = await gitCommandService.commitChanges(
        projectDir,
        "Initial commit via API"
      );
    } else {
      commitPerformed = await gitCommandService.commitChanges(projectDir, commitMessage);
    }
  }

  return {
    directory: projectDir,
    gitInitialized: gitInitialized,
    commitPerformed: commitPerformed,
    message: commitPerformed
      ? `Commit successful: ${commitMessage}`
      : "No changes to commit.",
  };
};

const revertChanges = async (projectDir) => {
    return await gitCommandService.revertGitChanges(projectDir);
};

const getGitStatusForProject = async (projectId) => {
  const project = await projectService.getProjectById(projectId, true);
  if (!project) {
    throw new Error("Project not found");
  }

  const statusResults = [];
  const rootIsDirExists = await fileService.directoryExists(project.directory);
  if (rootIsDirExists) {
    const rootStatus = await gitCommandService.getGitStatus(project.directory);
    statusResults.push({
      projectId: project.id,
      projectTitle: project.title,
      isDirectory: true,
      isRoot: !project.parentId,
      ...rootStatus,
    });
  } else {
    statusResults.push({
      projectId: project.id,
      projectTitle: project.title,
      isDirectory: false,
      isRepo: false,
      files: [],
      totalChanges: 0,
      currentBranch: null,
      isRoot: !project.parentId,
    });
  }

  if (project.children && project.children.length > 0) {
    for (const child of project.children) {
      const childDirExists = await fileService.directoryExists(child.directory);
      if (childDirExists) {
        const childStatus = await gitCommandService.getGitStatus(child.directory);
        statusResults.push({
          projectId: child.id,
          projectTitle: child.title,
          isDirectory: true,
          isRoot: false,
          ...childStatus,
        });
      } else {
        statusResults.push({
          projectId: child.id,
          projectTitle: child.title,
          isDirectory: false,
          isRepo: false,
          files: [],
          totalChanges: 0,
          currentBranch: null,
          isRoot: false,
        });
      }
    }
  }

  return statusResults;
};

const cloneAndSetupSubProject = async (
  parentId,
  repositoryUrl,
  projectName,
  directory
) => {
  let rootProjectDir = directory;
  let rootProjectId = parentId;

  if (!parentId) {
    if (!projectName || !directory) {
      throw new Error(
        "Project name and directory are required for a new root project."
      );
    }
    const newRootProject = await projectService.createProject({
      title: projectName,
      directory: directory,
      parentId: null,
      description: "Projeto raiz para repositórios importados",
    });
    rootProjectDir = newRootProject.directory;
    rootProjectId = newRootProject.id;
  }

  const repoName = repositoryUrl.split("/").pop().replace(".git", "");
  const clonePath = path.join(rootProjectDir, repoName);
  if (await fileService.directoryExists(clonePath)) {
    throw new Error(`O diretório '${clonePath}' já existe.`);
  }

  await gitCommandService.cloneRepo(repositoryUrl, clonePath);
  logger.info(`Repositório '${repositoryUrl}' clonado em '${clonePath}'`);
  const newSubProject = await projectService.createProject({
    title: repoName,
    directory: clonePath,
    parentId: rootProjectId,
    description: `Importado de ${repositoryUrl}`,
  });
  
  const branches = await gitCommandService.getGitLocalBranches(clonePath);

  return { ...newSubProject, branches: branches };
};

const getRemotesForProject = async (projectId) => {
  const project = await projectService.getProjectById(projectId);
  if (
    !project ||
    !project.directory ||
    !(await gitCommandService.isGitRepository(project.directory))
  ) {
    return [];
  }
  return await gitCommandService.getGitRemotes(project.directory);
};

const getRemoteStatus = async (projectId) => {
  const project = await projectService.getProjectById(projectId);
  if (
    !project ||
    !project.directory ||
    !(await gitCommandService.isGitRepository(project.directory))
  ) {
    throw new Error(
      "Project is not a valid git repository or directory not found."
    );
  }

  try {
    return await gitCommandService.fetchAndGetRemoteStatus(project.directory);
  } catch (error) {
    logger.error(
      `Error fetching remote status for ${project.directory}: ${error.message}`
    );
    let currentBranch = 'unknown';
    try {
        currentBranch = await gitCommandService.getCurrentBranch(project.directory);
    } catch (branchError) {
        logger.error(`Could not get current branch for ${project.directory}: ${branchError.message}`);
    }
    return {
      behind: 0,
      ahead: 0,
      current: currentBranch,
      tracking: null,
      error: "Could not fetch from remote. A remote may not be configured.",
    };
  }
};

const getLocalBranches = async (projectId) => {
  const project = await projectService.getProjectById(projectId);
  if (
    !project ||
    !project.directory ||
    !(await gitCommandService.isGitRepository(project.directory))
  ) {
    throw new Error(
      "Project is not a valid git repository or directory not found."
    );
  }
  try {
    return await gitCommandService.getGitLocalBranches(project.directory);
  } catch (error) {
    logger.error(
      `Error fetching local branches for ${project.directory}: ${error.message}`
    );
    throw new Error("Failed to fetch local branches.");
  }
};


module.exports = {
  processCommit,
  revertChanges,
  getGitStatusForProject,
  initializeRepositoryForProject,
  cloneAndSetupSubProject,
  getRemotesForProject,
  getRemoteStatus,
  getLocalBranches,
  
  createBranch: gitProjectService.createBranch,
  mergeBranch: gitProjectService.mergeBranch,
  addRemoteToProject: gitProjectService.addRemoteToProject,
  removeRemoteFromProject: gitProjectService.removeRemoteFromProject,
  pushFromProject: gitProjectService.pushFromProject,
  pullToProject: gitProjectService.pullToProject,
  checkoutBranch: gitProjectService.checkoutBranch,

  getProjectReferenceBranch: gitDbService.getProjectReferenceBranch,
  setProjectReferenceBranch: gitDbService.setProjectReferenceBranch,

  addEntryToGitignore: gitignoreService.addEntryToGitignore,
};