const simpleGit = require("simple-git");
const logger = require("../../utils/logger");

const gitOptions = {
  baseDir: process.cwd(),
  binary: "git",
  maxConcurrentProcesses: 6,
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
    logger.error(
      `Error checking if ${projectDir} is a Git repository: ${error.message}`
    );
    return false;
  }
};

const commitChanges = async (projectDir, message) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  try {
    await git.add("./*");
    const status = await git.status();
    if (status.files.length > 0 || status.staged.length > 0) {
      await git.commit(message);
      logger.info(
        `Changes committed in ${projectDir} with message: "${message}"`
      );
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

const revertGitChanges = async (projectDir) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  try {
    logger.warn(`Performing hard reset and clean on: ${projectDir}`);
    await git.reset(["--hard", "HEAD"]);
    logger.info(`Hard reset completed for ${projectDir}.`);
    await git.clean("f", ["-d"]);
    logger.info(`Clean completed for ${projectDir}.`);
    return { message: "Repository successfully reverted to the last commit." };
  } catch (error) {
    logger.error(
      `Error during revert process in ${projectDir}: ${error.message}`
    );
    throw new Error("Failed to revert changes.");
  }
};

const getGitStatus = async (projectDir) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  const isRepo = await isGitRepository(projectDir);

  if (!isRepo) {
    return { isRepo: false, files: [], totalChanges: 0, currentBranch: null };
  }

  const status = await git.status();
  const branchInfo = await git.branch();
  const totalChanges = status.files.length;
  return {
    isRepo: true,
    files: status.files,
    totalChanges,
    currentBranch: branchInfo.current,
  };
};

const getGitRemotes = async (projectDir) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  return await git.getRemotes(true);
};

const addGitRemote = async (projectDir, remoteName, remoteUrl) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  await git.addRemote(remoteName, remoteUrl);
};

const removeGitRemote = async (projectDir, remoteName) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  await git.removeRemote(remoteName);
};

const pushToRemote = async (projectDir, remoteName, branch) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  await git.push(remoteName, branch, ["--set-upstream"]);
};

const pullFromRemote = async (projectDir, remoteName, branch) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  return await git.pull(remoteName, branch);
};

const fetchAndGetRemoteStatus = async (projectDir) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  await git.fetch();
  const status = await git.status();
  return {
    behind: status.behind,
    ahead: status.ahead,
    current: status.current,
    tracking: status.tracking,
  };
};

const getGitLocalBranches = async (projectDir) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  const branches = await git.branchLocal();
  return branches.all;
};

const createGitBranch = async (projectDir, newBranchName, referenceBranch) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  const { current } = await git.branch();
  if (current !== referenceBranch) {
    throw new Error(
      `Must be on branch '${referenceBranch}' to create a new branch. Currently on '${current}'.`
    );
  }
  await git.checkout(["-b", newBranchName]);
};

const checkoutGitBranch = async (projectDir, branchName) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  const status = await git.status();
  if (status.files.length > 0) {
    throw new Error(
      `Cannot checkout branch: You have uncommitted changes in ${path.basename(
        projectDir
      )}.`
    );
  }
  await git.checkout(branchName);
};

const mergeGitBranch = async (projectDir, branchToMerge, targetBranch, deleteAfterMerge) => {
  const git = simpleGit({ ...gitOptions, baseDir: projectDir });
  if (branchToMerge === targetBranch) {
    throw new Error("Cannot merge the reference branch into itself.");
  }
  await git.checkout(targetBranch);
  await git.merge([branchToMerge]);
  
  if (deleteAfterMerge) {
    await git.deleteLocalBranch(branchToMerge);
    return `Branch '${branchToMerge}' merged into '${targetBranch}'. Branch '${branchToMerge}' deleted.`;
  }
  return `Branch '${branchToMerge}' merged into '${targetBranch}'.`;
};

const cloneRepo = async (repositoryUrl, clonePath) => {
  await simpleGit().clone(repositoryUrl, clonePath);
};

const getCurrentBranch = async (projectDir) => {
    const git = simpleGit({ ...gitOptions, baseDir: projectDir });
    const { current } = await git.branch();
    return current;
};

module.exports = {
  initializeGit,
  isGitRepository,
  commitChanges,
  revertGitChanges,
  getGitStatus,
  getGitRemotes,
  addGitRemote,
  removeGitRemote,
  pushToRemote,
  pullFromRemote,
  fetchAndGetRemoteStatus,
  getGitLocalBranches,
  createGitBranch,
  checkoutGitBranch,
  mergeGitBranch,
  cloneRepo,
  getCurrentBranch,
  gitOptions,
};