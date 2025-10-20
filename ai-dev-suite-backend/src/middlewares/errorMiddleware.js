const responseFormatter = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errorMessage = 'An unexpected error occurred on the server.';

  if (err.statusCode) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    
    switch (statusCode) {
      case 400:
        errorCode = 'BAD_REQUEST';
        break;
      case 404:
        errorCode = 'NOT_FOUND';
        break;
      case 409:
        errorCode = 'CONFLICT';
        break;
      default:
        errorCode = 'SERVER_ERROR';
    }
  }

  return responseFormatter.error(res, statusCode, errorCode, errorMessage);
};

module.exports = errorMiddleware;