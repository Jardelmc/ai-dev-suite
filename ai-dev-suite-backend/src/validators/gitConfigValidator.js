const Joi = require('joi');

const setUserConfigSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required.',
    'any.required': 'Name is required.'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.'
  })
});

const setEditorConfigSchema = Joi.object({
  editor: Joi.string().trim().required().messages({
    'string.empty': 'Editor command is required.',
    'any.required': 'Editor command is required.'
  })
});

const addAliasSchema = Joi.object({
  alias: Joi.string().trim().regex(/^[a-zA-Z0-9_-]+$/).required().messages({
    'string.empty': 'Alias name is required.',
    'string.pattern.base': 'Alias name can only contain letters, numbers, underscores, and hyphens.',
    'any.required': 'Alias name is required.'
  }),
  command: Joi.string().trim().required().messages({
    'string.empty': 'Alias command is required.',
    'any.required': 'Alias command is required.'
  })
});

const removeAliasSchema = Joi.object({
  alias: Joi.string().trim().regex(/^[a-zA-Z0-9_-]+$/).required().messages({
      'string.empty': 'Alias name parameter is required.',
      'string.pattern.base': 'Alias name parameter can only contain letters, numbers, underscores, and hyphens.',
      'any.required': 'Alias name parameter is required.'
  })
});


module.exports = {
  setUserConfigSchema,
  setEditorConfigSchema,
  addAliasSchema,
  removeAliasSchema,
};