const { v4: uuidv4 } = require('uuid');
const dbService = require('./dbService');
const logger = require('../utils/logger');

const getAllPrompts = async () => {
  const db = await dbService.readDb();
  return db.prompts || [];
};

const getPromptsByCategory = async (categoryId) => {
  const db = await dbService.readDb();
  return db.prompts.filter(prompt => prompt.categoryId === categoryId) || [];
};

const getPromptById = async (id) => {
  const db = await dbService.readDb();
  return db.prompts.find(prompt => prompt.id === id) || null;
};

const createPrompt = async ({ title, content, categoryId, tags, description }) => {
  const db = await dbService.readDb();
  
  if (categoryId) {
    const categoryExists = db.categories.find(cat => cat.id === categoryId);
    if (!categoryExists) {
      throw new Error('Category not found.');
    }
  }

  const newPrompt = {
    id: uuidv4(),
    title,
    content,
    categoryId: categoryId || null,
    tags: tags || [],
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.prompts.push(newPrompt);
  await dbService.writeDb(db);
  logger.info(`Prompt created: ${title} (id: ${newPrompt.id})`);
  return newPrompt;
};

const updatePrompt = async (id, { title, content, categoryId, tags, description }) => {
  const db = await dbService.readDb();
  const promptIndex = db.prompts.findIndex(prompt => prompt.id === id);
  
  if (promptIndex === -1) {
    return null;
  }

  if (categoryId) {
    const categoryExists = db.categories.find(cat => cat.id === categoryId);
    if (!categoryExists) {
      throw new Error('Category not found.');
    }
  }

  const updatedPrompt = {
    ...db.prompts[promptIndex],
    ...(title && { title }),
    ...(content !== undefined && { content }),
    ...(categoryId !== undefined && { categoryId }),
    ...(tags !== undefined && { tags }),
    ...(description !== undefined && { description }),
    updatedAt: new Date().toISOString()
  };

  db.prompts[promptIndex] = updatedPrompt;
  await dbService.writeDb(db);
  logger.info(`Prompt updated: ${id}`);
  return updatedPrompt;
};

const deletePrompt = async (id) => {
  const db = await dbService.readDb();
  const promptIndex = db.prompts.findIndex(prompt => prompt.id === id);
  
  if (promptIndex === -1) {
    return false;
  }

  db.prompts.splice(promptIndex, 1);
  await dbService.writeDb(db);
  logger.info(`Prompt deleted: ${id}`);
  return true;
};

module.exports = {
  getAllPrompts,
  getPromptsByCategory,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt
};