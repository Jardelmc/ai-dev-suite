const Joi = require('joi');

const faviconGenerationSchema = Joi.object({
  projectId: Joi.string().uuid().required().messages({
    'string.guid': 'Project ID must be a valid UUID.',
    'any.required': 'Project ID is required.'
  }),
  appName: Joi.string().required().max(100).messages({
    'string.empty': 'App name is required.',
    'any.required': 'App name is required.',
    'string.max': 'App name must not exceed 100 characters.'
  }),
  imageBase64: Joi.string().base64().required().messages({
    'string.base': 'Image must be a valid base64 string.',
    'string.empty': 'Image is required.',
    'any.required': 'Image is required.'
  })
});

module.exports = {
  faviconGenerationSchema
};