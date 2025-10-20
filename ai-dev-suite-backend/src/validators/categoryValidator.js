const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'string.empty': 'Category name is required.',
    'any.required': 'Category name is required.',
    'string.max': 'Category name must not exceed 100 characters.'
  }),
  description: Joi.string().allow('').max(500).messages({
    'string.max': 'Description must not exceed 500 characters.'
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).messages({
    'string.pattern.base': 'Color must be a valid hex color code (e.g., #007bff).'
  })
});

const updateCategorySchema = Joi.object({
  name: Joi.string().max(100).messages({
    'string.empty': 'Category name cannot be empty.',
    'string.max': 'Category name must not exceed 100 characters.'
  }),
  description: Joi.string().allow('').max(500).messages({
    'string.max': 'Description must not exceed 500 characters.'
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).messages({
    'string.pattern.base': 'Color must be a valid hex color code (e.g., #007bff).'
  })
}).min(1);

module.exports = {
  categorySchema,
  updateCategorySchema
};