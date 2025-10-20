const Joi = require('joi');

const metricsSchema = Joi.object({
    projectId: Joi.string().uuid().required().messages({
        'string.guid': 'Project ID must be a valid UUID.',
        'any.required': 'Project ID is required.'
    })
});

module.exports = {
    metricsSchema
};