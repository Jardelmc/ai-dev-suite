const Joi = require('joi');

const codeWriterSchema = Joi.object({
  projectId: Joi.string().uuid().messages({
    'string.guid': 'Project ID must be a valid UUID.'
  }),
  projectDir: Joi.string().messages({
    'string.base': 'Project directory must be a string.'
  }),
  generatedCode: Joi.string().required().messages({
    'string.empty': 'Generated code is required.',
    'any.required': 'Generated code is required.'
  })
}).xor('projectId', 'projectDir').messages({
  'object.xor': 'Either projectId or projectDir must be provided, but not both.'
});

module.exports = {
  codeWriterSchema
};