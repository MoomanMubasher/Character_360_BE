import { sendError } from '../utils/response.js';

export const validate = (schema, source = 'body') => {
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

    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};