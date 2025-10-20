const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(' ');
      logger.warn(`Validation failed: ${errorMessages}`);
      return responseFormatter.error(res, 400, 'VALIDATION_ERROR', errorMessages);
    }
    logger.info('Request validation successful.');
    next();
  };
};

module.exports = validateRequest;