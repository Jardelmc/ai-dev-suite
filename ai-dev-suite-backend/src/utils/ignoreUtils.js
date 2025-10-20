const path = require('path');
const dbService = require('../services/dbService');

const buildIgnoreMapForProject = async (projectId) => {
  const db = await dbService.readDb();
  const project = db.projects.find(p => p.id === projectId);

  if (!project) {
    return { globalIgnores: [], projectIgnoresMap: new Map(), allProjects: [] };
  }

  const normalizeIgnore = (i) => {
    if (typeof i.path === 'object' && i.path !== null && i.path.path) {
      return {
        id: i.id,
        path: i.path.path,
        scope: i.path.scope,
        projectId: i.path.projectId,
        createdAt: i.createdAt
      };
    }
    return i;
  };

  const normalizedIgnores = (db.ignores || []).map(normalizeIgnore);

  const globalIgnores = normalizedIgnores
    .filter(i => i.scope === 'global')
    .map(i => i.path);

  const projectIgnoresMap = new Map();

  const rootProjectIgnores = normalizedIgnores
    .filter(i => i.projectId === projectId && (i.scope === 'project' || i.scope === 'sub-project'))
    .map(i => i.path);
  projectIgnoresMap.set(projectId, rootProjectIgnores);

  const children = db.projects.filter(p => p.parentId === projectId);
  for (const child of children) {
    const childIgnores = normalizedIgnores
      .filter(i => i.projectId === child.id && (i.scope === 'project' || i.scope === 'sub-project'))
      .map(i => i.path);
    projectIgnoresMap.set(child.id, childIgnores);
  }

  return { globalIgnores, projectIgnoresMap, allProjects: [project, ...children] };
};

const shouldIgnoreEntry = (entryName, entryFullPath, basePath, globalIgnores, projectIgnoresMap, allProjects) => {
  if (globalIgnores.includes(entryName)) {
    return true;
  }

  for (const project of allProjects) {
    if (!project.directory) continue;

    const normalizedProjectDir = path.normalize(project.directory);
    const normalizedEntryPath = path.normalize(entryFullPath);

    const isInsideProjectDir = normalizedEntryPath.startsWith(normalizedProjectDir + path.sep) || 
                               normalizedEntryPath === normalizedProjectDir;

    if (isInsideProjectDir) {
      const projectIgnores = projectIgnoresMap.get(project.id) || [];
      if (projectIgnores.includes(entryName)) {
        return true;
      }
    }
  }

  return false;
};

module.exports = {
  buildIgnoreMapForProject,
  shouldIgnoreEntry
};