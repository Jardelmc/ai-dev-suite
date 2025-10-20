const Joi = require('joi');

const createTemplateSchema = Joi.object({
  name: Joi.string().required().max(200).messages({
    'string.empty': 'Template name is required.',
    'any.required': 'Template name is required.',
    'string.max': 'Name must not exceed 200 characters.'
  }),
  description: Joi.string().allow('').max(1000).messages({
    'string.max': 'Description must not exceed 1000 characters.'
  }),
  type: Joi.string().valid('backend', 'frontend').required().messages({
    'any.only': 'Type must be either "backend" or "frontend".',
    'any.required': 'Type is required.'
  }),
  content: Joi.string().required().messages({
    'string.empty': 'Content is required.',
    'any.required': 'Content is required.'
  })
});

const updateTemplateSchema = Joi.object({
  name: Joi.string().max(200).messages({
    'string.max': 'Name must not exceed 200 characters.'
  }),
  description: Joi.string().allow('').max(1000).messages({
    'string.max': 'Description must not exceed 1000 characters.'
  }),
  type: Joi.string().valid('backend', 'frontend').messages({
    'any.only': 'Type must be either "backend" or "frontend".'
  }),
  content: Joi.string().allow('')
}).min(1);

module.exports = {
  createTemplateSchema,
  updateTemplateSchema
};