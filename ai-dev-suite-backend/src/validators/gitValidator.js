const Joi = require('joi');

const gitCommitSchema = Joi.object({
  projectId: Joi.string().uuid().messages({
    'string.guid': 'Project ID must be a valid UUID.'
  }),
  projectDir: Joi.string().messages({
    'string.base': 'Project directory must be a string.'
  }),
  commitMessage: Joi.string().allow('').messages({
    'string.base': 'Commit message must be a string.'
  })
}).xor('projectId', 'projectDir').messages({
  'object.xor': 'Either projectId or projectDir must be provided, but not both.'
});

const gitRevertSchema = Joi.object({
  projectId: Joi.string().uuid().messages({
    'string.guid': 'Project ID must be a valid UUID.'
  }),
  projectDir: Joi.string().messages({
    'string.base': 'Project directory must be a string.'
  })
}).xor('projectId', 'projectDir').messages({
  'object.xor': 'Either projectId or projectDir must be provided, but not both.'
});

module.exports = {
  gitCommitSchema,
  gitRevertSchema
};