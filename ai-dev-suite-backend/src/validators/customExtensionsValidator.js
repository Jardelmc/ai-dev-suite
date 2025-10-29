const Joi = require('joi');

const addExtensionSchema = Joi.object({
  extension: Joi.string()
    .trim()
    .pattern(/^\.\w+([\w-]*\w+)*$/) // Starts with dot, followed by word chars/hyphens
    .required()
    .messages({
      'string.empty': 'Extension cannot be empty.',
      'any.required': 'Extension is required.',
      'string.pattern.base': 'Invalid extension format. Must start with a dot and contain valid characters (e.g., ".myext", ".env.dev").'
    })
});

module.exports = {
  addExtensionSchema,
};