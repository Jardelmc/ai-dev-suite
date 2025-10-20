const categoryService = require('../services/categoryService');
const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const listCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    logger.info('Categories retrieved successfully');
    return responseFormatter.success(res, 'Categories retrieved successfully', { categories });
  } catch (error) {
    logger.error(`Error listing categories: ${error.message}`);
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Category not found.');
    }
    logger.info(`Category retrieved: ${id}`);
    return responseFormatter.success(res, 'Category retrieved successfully', category);
  } catch (error) {
    logger.error(`Error getting category: ${error.message}`);
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const newCategory = await categoryService.createCategory({ name, description, color });
    logger.info(`Category created: ${newCategory.name}`);
    return responseFormatter.success(res, 'Category created successfully', newCategory, 201);
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const updatedCategory = await categoryService.updateCategory(id, { name, description, color });
    if (!updatedCategory) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Category not found.');
    }
    logger.info(`Category updated: ${id}`);
    return responseFormatter.success(res, 'Category updated successfully', updatedCategory);
  } catch (error) {
    logger.error(`Error updating category: ${error.message}`);
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await categoryService.deleteCategory(id);
    if (!deleted) {
      return responseFormatter.error(res, 404, 'NOT_FOUND', 'Category not found.');
    }
    logger.info(`Category deleted: ${id}`);
    return responseFormatter.success(res, 'Category deleted successfully');
  } catch (error) {
    logger.error(`Error deleting category: ${error.message}`);
    next(error);
  }
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};