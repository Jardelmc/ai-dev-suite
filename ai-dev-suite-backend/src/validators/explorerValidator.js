const Joi = require('joi');

const openExplorerSchema = Joi.object({
  directory: Joi.string().required().messages({
    'string.empty': 'Directory is required.',
    'any.required': 'Directory is required.'
  }),
});

module.exports = {
  openExplorerSchema,
};