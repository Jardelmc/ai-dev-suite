const { v4: uuidv4 } = require('uuid');
const dbService = require('./dbService');
const logger = require('../utils/logger');

const getAllProjects = async () => {
  const db = await dbService.readDb();
  return db.projects || [];
};

const getProjectsByParent = async (parentId) => {
  const db = await dbService.readDb();
  return db.projects.filter(project => project.parentId === parentId) || [];
};

const getProjectById = async (id, includeChildren = false) => {
  const db = await dbService.readDb();
  const project = db.projects.find(project => project.id === id);
  
  if (!project) {
    return null;
  }

  if (includeChildren) {
    const children = db.projects.filter(p => p.parentId === id);
    return { ...project, children };
  }

  return project;
};

const getProjectChildren = async (parentId) => {
  const db = await dbService.readDb();
  return db.projects.filter(project => project.parentId === parentId) || [];
};

const createProject = async ({ title, directory, parentId, description }) => {
  const db = await dbService.readDb();
  
  if (parentId) {
    const parentExists = db.projects.find(p => p.id === parentId);
    if (!parentExists) {
      throw new Error('Parent project not found.');
    }
  }

  if (!directory) {
    throw new Error('Directory is required for all projects.');
  }

  const newProject = {
    id: uuidv4(),
    title,
    directory,
    parentId: parentId || null,
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.push(newProject);
  await dbService.writeDb(db);
  logger.info(`Project created: ${title} (id: ${newProject.id})`);
  return newProject;
};

const updateProject = async (id, { title, directory, description }) => {
  const db = await dbService.readDb();
  const projectIndex = db.projects.findIndex(project => project.id === id);
  
  if (projectIndex === -1) {
    return null;
  }

  const project = db.projects[projectIndex];
  
  if (directory === '' || directory === null) {
    throw new Error('Directory is required and cannot be empty.');
  }

  const updatedProject = {
    ...project,
    ...(title && { title }),
    ...(directory !== undefined && { directory }),
    ...(description !== undefined && { description }),
    updatedAt: new Date().toISOString()
  };

  db.projects[projectIndex] = updatedProject;
  await dbService.writeDb(db);
  logger.info(`Project updated: ${id}`);
  return updatedProject;
};

const deleteProject = async (id) => {
  const db = await dbService.readDb();
  const projectIndex = db.projects.findIndex(project => project.id === id);
  
  if (projectIndex === -1) {
    return false;
  }

  const hasChildren = db.projects.some(project => project.parentId === id);
  if (hasChildren) {
    throw new Error('Cannot delete project that has subprojects. Delete the subprojects first.');
  }

  db.projects.splice(projectIndex, 1);
  await dbService.writeDb(db);
  logger.info(`Project deleted: ${id}`);
  return true;
};

module.exports = {
  getAllProjects,
  getProjectsByParent,
  getProjectById,
  getProjectChildren,
  createProject,
  updateProject,
  deleteProject
};