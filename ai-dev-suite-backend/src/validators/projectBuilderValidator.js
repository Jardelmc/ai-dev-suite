const Joi = require('joi');

const rootProjectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  directory: Joi.string().required(),
});

const subProjectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  templateId: Joi.string().uuid().required(),
});

const buildProjectSchema = Joi.object({
  rootProject: rootProjectSchema.required(),
  subProjects: Joi.array().items(subProjectSchema).min(1).required(),
});

const generatePromptSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  functionalities: Joi.string().required().min(10),
});

module.exports = {
  buildProjectSchema,
  generatePromptSchema,
};