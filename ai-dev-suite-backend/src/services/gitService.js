const simpleGit = require('simple-git');
const path = require('path');
const fileService = require('./fileService');
const logger = require('../utils/logger');
const projectService = require('./projectService');
const dbService = require('./dbService');

const gitOptions = {
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6
};

const createGitignore = async (projectDir, additionalContent = '') => {
    const gitignorePath = path.join(projectDir, '.gitignore');
    const baseContent = 'node_modules/\n.env\n*.log\n.idea/\n.vscode/\ndist/\nbuild/\npackage-lock.json\n';
    const finalContent = `${baseContent}\n${additionalContent}`.trim();
    await fileService.createFile(gitignorePath, finalContent);
    logger.info(`.gitignore created in ${projectDir}`);
};

const addEntryToGitignore = async (projectDir, entry) => {
    const gitignorePath = path.join(projectDir, '.gitignore');
    if (!await fileService.fileExists(gitignorePath)) {
        return;
    }
    const content = await fileService.readFileContent(gitignorePath);
    if (!content.includes(entry.trim())) {
        await fileService.appendToFile(gitignorePath, `\n${entry}`);
        logger.info(`Added '${entry}' to .gitignore in ${projectDir}`);
    }
};

const manageRootGitignoreForNewRepo = async (projectDir) => {
    const allProjects = await projectService.getAllProjects();
    const project = allProjects.find(p => p.directory === projectDir);

    if (!project || project.parentId) {
        const gitignorePath = path.join(projectDir, '.gitignore');
        if (!await fileService.fileExists(gitignorePath)) {
            await createGitignore(projectDir);
        }
        return;
    }

    const children = await projectService.getProjectChildren(project.id);
    const subProjectGitIgnores = children.map(child => {
        const relativePath = path.relative(project.directory, child.directory).replace(/\\/g, '/');
        return `${relativePath}/.git`;
    }).join('\n');

    const gitignorePath = path.join(projectDir, '.gitignore');
    if (await fileService.fileExists(gitignorePath)) {
        const entriesToAdd = subProjectGitIgnores.split('\n');
        for (const entry of entriesToAdd) {
            await addEntryToGitignore(projectDir, entry);
        }
    } else {
        await createGitignore(projectDir, subProjectGitIgnores);
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

const initializeRepositoryForProject = async (projectId) => {
    const project = await projectService.getProjectById(projectId);
    if (!project || !project.directory) {
        throw new Error('Project not found or has no directory configured.');
    }

    if (await isGitRepository(project.directory)) {
        throw new Error('Project is already a Git repository.');
    }

    await manageRootGitignoreForNewRepo(project.directory);
    await initializeGit(project.directory);
    await commitChanges(project.directory, 'Initial commit');

    logger.info(`Successfully initialized and committed for project: ${project.title}`);
    return { message: `Repository for '${project.title}' initialized successfully.` };
};

const processCommit = async (projectDir, commitMessage = 'Initial commit via API') => {
    const dirExists = await fileService.directoryExists(projectDir);
    let gitInitialized = false;
    let commitPerformed = false;

    if (!dirExists) {
        await fileService.createDirectory(projectDir);
        await manageRootGitignoreForNewRepo(projectDir);
        await initializeGit(projectDir);
        gitInitialized = true;
        commitPerformed = await commitChanges(projectDir, 'Initial commit via API');
    } else {
        const isGit = await isGitRepository(projectDir);
        if (!isGit) {
            await manageRootGitignoreForNewRepo(projectDir);
            await initializeGit(projectDir);
            gitInitialized = true;
            commitPerformed = await commitChanges(projectDir, 'Initial commit via API');
        } else {
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
                const childStatus = await getProjectStatus(child.directory);
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

const _getProjectDirs = async (projectId, applyToSubProjects) => {
    const project = await projectService.getProjectById(projectId, applyToSubProjects);
    if (!project) {
        throw new Error('Project not found.');
    }

    let dirs = [project.directory];
    if (applyToSubProjects && project.children) {
        dirs = dirs.concat(project.children.map(c => c.directory));
    }
    return dirs.filter(Boolean);
};

const createBranch = async (projectId, newBranchName, referenceBranch, applyToSubProjects) => {
    const dirs = await _getProjectDirs(projectId, applyToSubProjects);
    const results = [];
    for (const dir of dirs) {
        try {
            const git = simpleGit({ ...gitOptions, baseDir: dir });
            if (!await isGitRepository(dir)) {
                results.push({ directory: dir, success: false, error: 'Not a git repository.' });
                continue;
            }
            const { current } = await git.branch();
            if (current !== referenceBranch) {
                throw new Error(`Must be on branch '${referenceBranch}' to create a new branch. Currently on '${current}'.`);
            }
            await git.checkout(['-b', newBranchName]);
            results.push({ directory: dir, success: true, message: `Branch '${newBranchName}' created.` });
        } catch (error) {
            results.push({ directory: dir, success: false, error: error.message });
        }
    }
    return results;
};

const mergeBranch = async (projectId, referenceBranch, deleteAfterMerge, applyToSubProjects) => {
    const dirs = await _getProjectDirs(projectId, applyToSubProjects);
    const results = [];
    for (const dir of dirs) {
        try {
            const git = simpleGit({ ...gitOptions, baseDir: dir });
            if (!await isGitRepository(dir)) {
                results.push({ directory: dir, success: false, error: 'Not a git repository.' });
                continue;
            }
            const { current } = await git.branch();
            if (current === referenceBranch) {
                throw new Error('Cannot merge the reference branch into itself.');
            }
            await git.checkout(referenceBranch);
            await git.merge([current]);
            let message = `Branch '${current}' merged into '${referenceBranch}'.`;
            if (deleteAfterMerge) {
                await git.deleteLocalBranch(current);
                message += ` Branch '${current}' deleted.`;
            }
            results.push({ directory: dir, success: true, message });
        } catch (error) {
            results.push({ directory: dir, success: false, error: error.message });
        }
    }
    return results;
};

const getProjectReferenceBranch = async (projectId) => {
    const db = await dbService.readDb();
    let setting = db.gitSettings.find(s => s.projectId === projectId);

    if (setting) {
        return setting;
    }

    const project = await projectService.getProjectById(projectId);
    if (!project || !project.directory || !await isGitRepository(project.directory)) {
        throw new Error('Project is not a valid git repository or directory not found.');
    }

    const git = simpleGit({ ...gitOptions, baseDir: project.directory });
    const { current } = await git.branch();
    setting = { projectId, referenceBranch: current };
    db.gitSettings.push(setting);
    await dbService.writeDb(db);
    logger.info(`Automatically set reference branch for project ${projectId} to '${current}'`);
    return setting;
};

const setProjectReferenceBranch = async (projectId, branchName, applyToSubProjects) => {
    const db = await dbService.readDb();
    let setting = db.gitSettings.find(s => s.projectId === projectId);

    if (setting) {
        setting.referenceBranch = branchName;
    } else {
        db.gitSettings.push({ projectId, referenceBranch: branchName });
    }
    await dbService.writeDb(db);

    const dirs = await _getProjectDirs(projectId, applyToSubProjects);
    const results = [];
    for (const dir of dirs) {
        try {
            const git = simpleGit({ ...gitOptions, baseDir: dir });
            if (!await isGitRepository(dir)) {
                results.push({ directory: dir, success: false, error: 'Not a git repository.' });
                continue;
            }
            await git.branch(['-M', branchName]);
            results.push({ directory: dir, success: true, message: `Branch renamed to '${branchName}'.` });
        } catch (error) {
            results.push({ directory: dir, success: false, error: error.message });
        }
    }
    logger.info(`Reference branch for project ${projectId} updated to '${branchName}' and renamed.`);
    return results;
};

const cloneAndSetupSubProject = async (parentId, repositoryUrl, projectName, directory) => {
    let rootProjectDir = directory;
    let rootProjectId = parentId;

    if (!parentId) {
        if (!projectName || !directory) {
            throw new Error("Project name and directory are required for a new root project.");
        }
        const newRootProject = await projectService.createProject({
            title: projectName,
            directory: directory,
            parentId: null,
            description: 'Projeto raiz para repositórios importados',
        });
        rootProjectDir = newRootProject.directory;
        rootProjectId = newRootProject.id;
    }

    const repoName = repositoryUrl.split('/').pop().replace('.git', '');
    const clonePath = path.join(rootProjectDir, repoName);

    if (await fileService.directoryExists(clonePath)) {
        throw new Error(`O diretório '${clonePath}' já existe.`);
    }

    await simpleGit().clone(repositoryUrl, clonePath);
    logger.info(`Repositório '${repositoryUrl}' clonado em '${clonePath}'`);

    const newSubProject = await projectService.createProject({
        title: repoName,
        directory: clonePath,
        parentId: rootProjectId,
        description: `Importado de ${repositoryUrl}`,
    });

    const git = simpleGit({ baseDir: clonePath });
    const branches = await git.branchLocal();

    return { ...newSubProject, branches: branches.all };
};

const getRemotesForProject = async (projectId) => {
    const project = await projectService.getProjectById(projectId);
    if (!project || !project.directory || !await isGitRepository(project.directory)) {
        return [];
    }
    const git = simpleGit({ ...gitOptions, baseDir: project.directory });
    return await git.getRemotes(true);
};

const addRemoteToProject = async (projectId, applyToSubProjects, remoteName, remoteUrl) => {
    const dirs = await _getProjectDirs(projectId, applyToSubProjects);
    const results = [];
    for (const dir of dirs) {
        try {
            const git = simpleGit({ ...gitOptions, baseDir: dir });
            if (!await isGitRepository(dir)) {
                results.push({ directory: dir, success: false, error: 'Not a git repository.' });
                continue;
            }
            await git.addRemote(remoteName, remoteUrl);
            results.push({ directory: dir, success: true, message: `Remote '${remoteName}' added.` });
        } catch (error) {
            results.push({ directory: dir, success: false, error: error.message });
        }
    }
    return results;
};

const removeRemoteFromProject = async (projectId, applyToSubProjects, remoteName) => {
    const dirs = await _getProjectDirs(projectId, applyToSubProjects);
    const results = [];
    for (const dir of dirs) {
        try {
            const git = simpleGit({ ...gitOptions, baseDir: dir });
            if (!await isGitRepository(dir)) {
                results.push({ directory: dir, success: false, error: 'Not a git repository.' });
                continue;
            }
            await git.removeRemote(remoteName);
            results.push({ directory: dir, success: true, message: `Remote '${remoteName}' removed.` });
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
            const git = simpleGit({ ...gitOptions, baseDir: dir });
            if (!await isGitRepository(dir)) {
                results.push({ directory: dir, success: false, error: 'Not a git repository.' });
                continue;
            }
            const { current } = await git.branch();
            await git.push(remoteName, current, ['--set-upstream']);
            results.push({ directory: dir, success: true, message: `Pushed branch '${current}' to '${remoteName}'.` });
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
            const git = simpleGit({ ...gitOptions, baseDir: dir });
            if (!await isGitRepository(dir)) {
                results.push({ directory: dir, success: false, error: 'Not a git repository.' });
                continue;
            }
            const { current } = await git.branch();
            const pullResult = await git.pull(remoteName, current);
            results.push({ directory: dir, success: true, message: 'Pull successful.', summary: pullResult });
        } catch (error) {
            if (error.git && error.git.conflicts && error.git.conflicts.length > 0) {
                results.push({ directory: dir, success: false, error: 'Merge conflict detected.', conflict: true, summary: error.git });
            } else {
                results.push({ directory: dir, success: false, error: error.message, conflict: false });
            }
        }
    }
    return results;
};

const getRemoteStatus = async (projectId) => {
    const project = await projectService.getProjectById(projectId);
    if (!project || !project.directory || !await isGitRepository(project.directory)) {
        throw new Error('Project is not a valid git repository or directory not found.');
    }

    const git = simpleGit({ ...gitOptions, baseDir: project.directory });
    try {
        await git.fetch();
        const status = await git.status();
        return {
            behind: status.behind,
            ahead: status.ahead,
            current: status.current,
            tracking: status.tracking,
        };
    } catch (error) {
        logger.error(`Error fetching remote status for ${project.directory}: ${error.message}`);
        return {
            behind: 0,
            ahead: 0,
            current: (await git.branch()).current,
            tracking: null,
            error: 'Could not fetch from remote. A remote may not be configured.'
        };
    }
};

module.exports = {
  processCommit,
  revertChanges,
  initializeGit,
  isGitRepository,
  commitChanges,
  createGitignore,
  addEntryToGitignore,
  getGitStatusForProject,
  createBranch,
  mergeBranch,
  getProjectReferenceBranch,
  setProjectReferenceBranch,
  initializeRepositoryForProject,
  cloneAndSetupSubProject,
  getRemotesForProject,
  addRemoteToProject,
  removeRemoteFromProject,
  pushFromProject,
  pullToProject,
  getRemoteStatus,
};