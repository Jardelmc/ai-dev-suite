const Joi = require('joi');

const promptSchema = Joi.object({
  title: Joi.string().required().max(200).messages({
    'string.empty': 'Prompt title is required.',
    'any.required': 'Prompt title is required.',
    'string.max': 'Title must not exceed 200 characters.'
  }),
  content: Joi.string().required().messages({
    'string.empty': 'Prompt content is required.',
    'any.required': 'Prompt content is required.'
  }),
  categoryId: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Category ID must be a valid UUID.'
  }),
  tags: Joi.array().items(Joi.string().max(50)).max(10).messages({
    'array.max': 'Maximum 10 tags are allowed.',
    'string.max': 'Each tag must not exceed 50 characters.'
  }),
  description: Joi.string().allow('').max(1000).messages({
    'string.max': 'Description must not exceed 1000 characters.'
  })
});

const updatePromptSchema = Joi.object({
  title: Joi.string().max(200).messages({
    'string.empty': 'Prompt title cannot be empty.',
    'string.max': 'Title must not exceed 200 characters.'
  }),
  content: Joi.string().messages({
    'string.empty': 'Prompt content cannot be empty.'
  }),
  categoryId: Joi.string().uuid().allow(null).messages({
    'string.guid': 'Category ID must be a valid UUID.'
  }),
  tags: Joi.array().items(Joi.string().max(50)).max(10).messages({
    'array.max': 'Maximum 10 tags are allowed.',
    'string.max': 'Each tag must not exceed 50 characters.'
  }),
  description: Joi.string().allow('').max(1000).messages({
    'string.max': 'Description must not exceed 1000 characters.'
  })
}).min(1);

module.exports = {
  promptSchema,
  updatePromptSchema
};