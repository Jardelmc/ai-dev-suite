const path = require("path");
const fileService = require("../fileService");
const logger = require("../../utils/logger");
const projectService = require("../projectService");

const createGitignore = async (projectDir, additionalContent = "") => {
  const gitignorePath = path.join(projectDir, ".gitignore");
  const baseContent =
    "node_modules/\n.env\n*.log\n.idea/\n.vscode/\ndist/\nbuild/\npackage-lock.json\n";
  const finalContent = `${baseContent}\n${additionalContent}`.trim();
  await fileService.createFile(gitignorePath, finalContent);
  logger.info(`.gitignore created in ${projectDir}`);
};

const addEntryToGitignore = async (projectDir, entry) => {
  const gitignorePath = path.join(projectDir, ".gitignore");
  if (!(await fileService.fileExists(gitignorePath))) {
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
  const project = allProjects.find((p) => p.directory === projectDir);

  if (!project || project.parentId) {
    const gitignorePath = path.join(projectDir, ".gitignore");
    if (!(await fileService.fileExists(gitignorePath))) {
      await createGitignore(projectDir);
    }
    return;
  }

  const children = await projectService.getProjectChildren(project.id);
  const subProjectGitIgnores = children
    .map((child) => {
      const relativePath = path
        .relative(project.directory, child.directory)
        .replace(/\\/g, "/");
      return `${relativePath}/.git`;
    })
    .join("\n");
  const gitignorePath = path.join(projectDir, ".gitignore");
  if (await fileService.fileExists(gitignorePath)) {
    const entriesToAdd = subProjectGitIgnores.split("\n");
    for (const entry of entriesToAdd) {
      await addEntryToGitignore(projectDir, entry);
    }
  } else {
    await createGitignore(projectDir, subProjectGitIgnores);
  }
};

module.exports = {
  createGitignore,
  addEntryToGitignore,
  manageRootGitignoreForNewRepo,
};