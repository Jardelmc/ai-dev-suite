const { v4: uuidv4 } = require('uuid');
const dbService = require('./dbService');
const logger = require('../utils/logger');

const getAllCategories = async () => {
  const db = await dbService.readDb();
  return db.categories || [];
};

const getCategoryById = async (id) => {
  const db = await dbService.readDb();
  return db.categories.find(category => category.id === id) || null;
};

const createCategory = async ({ name, description, color }) => {
  const db = await dbService.readDb();
  
  const existingCategory = db.categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  if (existingCategory) {
    throw new Error('Category with this name already exists.');
  }

  const newCategory = {
    id: uuidv4(),
    name,
    description: description || '',
    color: color || '#007bff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.categories.push(newCategory);
  await dbService.writeDb(db);
  logger.info(`Category created: ${name} (id: ${newCategory.id})`);
  return newCategory;
};

const updateCategory = async (id, { name, description, color }) => {
  const db = await dbService.readDb();
  const categoryIndex = db.categories.findIndex(category => category.id === id);
  
  if (categoryIndex === -1) {
    return null;
  }

  if (name) {
    const existingCategory = db.categories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase() && cat.id !== id
    );
    if (existingCategory) {
      throw new Error('Category with this name already exists.');
    }
  }

  const updatedCategory = {
    ...db.categories[categoryIndex],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(color && { color }),
    updatedAt: new Date().toISOString()
  };

  db.categories[categoryIndex] = updatedCategory;
  await dbService.writeDb(db);
  logger.info(`Category updated: ${id}`);
  return updatedCategory;
};

const deleteCategory = async (id) => {
  const db = await dbService.readDb();
  const categoryIndex = db.categories.findIndex(category => category.id === id);
  
  if (categoryIndex === -1) {
    return false;
  }

  const hasPrompts = db.prompts.some(prompt => prompt.categoryId === id);
  if (hasPrompts) {
    throw new Error('Cannot delete category that contains prompts. Delete the prompts first.');
  }

  db.categories.splice(categoryIndex, 1);
  await dbService.writeDb(db);
  logger.info(`Category deleted: ${id}`);
  return true;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};