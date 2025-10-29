const dbService = require("../dbService");
const logger = require("../../utils/logger");
const projectService = require("../projectService");
const { isGitRepository, getCurrentBranch, gitOptions } = require("./gitCommandService");
const simpleGit = require("simple-git");

const getProjectReferenceBranch = async (projectId) => {
  const db = await dbService.readDb();
  let setting = db.gitSettings.find((s) => s.projectId === projectId);

  if (setting) {
    return setting;
  }

  const project = await projectService.getProjectById(projectId);
  if (
    !project ||
    !project.directory ||
    !(await isGitRepository(project.directory))
  ) {
    return { projectId, referenceBranch: null, message: "No reference branch set and project is not a valid git repo or has no setting."
    };
  }

  const current = await getCurrentBranch(project.directory);
  setting = { projectId, referenceBranch: current };
  db.gitSettings.push(setting);
  await dbService.writeDb(db);
  logger.info(
    `Automatically set reference branch for project ${projectId} to '${current}'`
  );
  return setting;
};

const setProjectReferenceBranch = async (
  projectId,
  branchName,
  applyToSubProjects
) => {
  const db = await dbService.readDb();
  let setting = db.gitSettings.find((s) => s.projectId === projectId);

  if (setting) {
    setting.referenceBranch = branchName;
  } else {
    db.gitSettings.push({ projectId, referenceBranch: branchName });
  }
  await dbService.writeDb(db);
  
  const project = await projectService.getProjectById(projectId, true);
  if (applyToSubProjects && project && project.children) {
    for (const child of project.children) {
        let childSetting = db.gitSettings.find((s) => s.projectId === child.id);
        if (childSetting) {
            childSetting.referenceBranch = branchName;
        } else {
            db.gitSettings.push({ projectId: child.id, referenceBranch: branchName });
        }
    }
    await dbService.writeDb(db);
  }

  logger.info(
    `Reference branch preference for project ${projectId} updated to '${branchName}'. Applied to subprojects: ${applyToSubProjects}`
  );
  return { success: true, message: `Reference branch preference updated to '${branchName}'.`};
};

module.exports = {
  getProjectReferenceBranch,
  setProjectReferenceBranch,
};