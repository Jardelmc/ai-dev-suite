const { v4: uuidv4 } = require('uuid');
const dbService = require('./dbService');
const logger = require('../utils/logger');

const _normalizeIgnore = (item) => {
  if (typeof item.path === 'object' && item.path !== null && item.path.path) {
    return {
      id: item.id,
      path: item.path.path,
      scope: item.path.scope,
      projectId: item.path.projectId,
      createdAt: item.createdAt,
    };
  }
  return item;
};

const getIgnoresForProject = async (projectId) => {
  const db = await dbService.readDb();
  const normalizedIgnores = (db.ignores || []).map(_normalizeIgnore);

  const globalIgnores = normalizedIgnores
    .filter(i => i.scope === 'global')
    .map(i => ({ ...i, effectiveScope: 'global' }));

  const projectIgnores = normalizedIgnores
    .filter(i => i.projectId === projectId && i.scope === 'project')
    .map(i => ({ ...i, effectiveScope: 'project' }));

  const project = db.projects.find(p => p.id === projectId);
  let subProjectIgnores = [];

  if (project && project.parentId) {
    subProjectIgnores = normalizedIgnores
      .filter(i => i.projectId === project.parentId && i.scope === 'sub-project')
      .map(i => ({ ...i, effectiveScope: 'sub-project' }));
  }

  return {
    global: globalIgnores,
    project: projectIgnores,
    subProject: subProjectIgnores,
    all: [...globalIgnores, ...projectIgnores, ...subProjectIgnores]
  };
};

const getAllIgnores = async () => {
  const db = await dbService.readDb();
  return (db.ignores || []).map(_normalizeIgnore);
};

const createIgnore = async (path, scope, projectId) => {
  const db = await dbService.readDb();
  if (!db.ignores) {
    db.ignores = [];
  }

  const isNested = typeof path === 'object' && path !== null && path.path;
  const finalPath = isNested ? path.path : path;
  const finalScope = isNested ? path.scope : scope;
  const finalProjectId = isNested ? path.projectId : projectId;

  const normalizedIgnores = db.ignores.map(_normalizeIgnore);

  const existingIgnore = normalizedIgnores.find(
    i => i.path === finalPath && i.scope === finalScope &&
    ((finalScope === 'global' && !i.projectId) || (i.projectId === finalProjectId))
  );

  if (existingIgnore) {
    throw new Error('Este item já está na lista de ignorados.');
  }

  const newIgnore = {
    id: uuidv4(),
    path: finalPath,
    scope: finalScope,
    projectId: finalScope === 'global' ? null : finalProjectId,
    createdAt: new Date().toISOString()
  };

  db.ignores.push(newIgnore);
  await dbService.writeDb(db);

  logger.info('Ignore created', finalPath);
  return newIgnore;
};

const deleteIgnore = async (id) => {
  const db = await dbService.readDb();
  const ignoreIndex = db.ignores.findIndex(i => i.id === id);

  if (ignoreIndex === -1) {
    return false;
  }

  db.ignores.splice(ignoreIndex, 1);
  await dbService.writeDb(db);

  logger.info('Ignore deleted', id);
  return true;
};

module.exports = {
  getIgnoresForProject,
  getAllIgnores,
  createIgnore,
  deleteIgnore
};