const formatSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message: message,
    data: data
  });
};

const formatError = (res, statusCode, code, message, data = {}) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: code,
      message: message
    },
    ...(Object.keys(data).length > 0 && { data })
  });
};

module.exports = {
  success: formatSuccess,
  error: formatError
};