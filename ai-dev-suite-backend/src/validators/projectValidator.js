const Joi = require('joi');

const projectSchema = Joi.object({
  title: Joi.string().required().max(200).messages({
    'string.empty': 'Project title is required.',
    'any.required': 'Project title is required.',
    'string.max': 'Title must not exceed 200 characters.'
  }),
  directory: Joi.string().required().messages({
    'string.empty': 'Directory is required.',
    'any.required': 'Directory is required.'
  }),
  parentId: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Parent ID must be a valid UUID.'
  }),
  description: Joi.string().allow('').max(1000).messages({
    'string.max': 'Description must not exceed 1000 characters.'
  })
});

const updateProjectSchema = Joi.object({
  title: Joi.string().max(200).messages({
    'string.empty': 'Project title cannot be empty.',
    'string.max': 'Title must not exceed 200 characters.'
  }),
  directory: Joi.string().messages({
    'string.empty': 'Directory cannot be empty when provided.',
  }),
  parentId: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Parent ID must be a valid UUID.'
  }),
  description: Joi.string().allow('').max(1000).messages({
    'string.max': 'Description must not exceed 1000 characters.'
  })
}).min(1);

module.exports = {
  projectSchema,
  updateProjectSchema
};