
const { sendError } = require('../utils/response');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = source === 'query' ? req.query : req.body;

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      return sendError(res, 400, 'Validation failed', errors);
    }

    // Replace with validated/sanitized data
    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

module.exports = { validate };