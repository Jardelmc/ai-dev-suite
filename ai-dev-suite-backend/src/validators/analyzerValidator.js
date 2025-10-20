const Joi = require('joi');
const analyzerSchema = Joi.object({
  projectId: Joi.string().uuid().messages({
    'string.guid': 'Project ID must be a valid UUID.'
  }),
  projectDir: Joi.string().messages({
    'string.base': 'Project directory must be a string.'
  }),
  excludedSubprojectIds: Joi.array().items(Joi.string().uuid()).optional().messages({
    'array.base': 'excludedSubprojectIds must be an array.',
    'string.guid': 'Each excluded ID must be a valid UUID.'
  })
}).xor('projectId', 'projectDir').messages({
  'object.xor': 'Either projectId or projectDir must be provided, but not both.'
});
module.exports = {
  analyzerSchema
};