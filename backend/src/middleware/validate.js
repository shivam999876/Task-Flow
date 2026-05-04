/**
 * Middleware factory: Validates req.body against a Joi schema.
 * Aborts early is disabled — returns ALL validation errors at once.
 * Returns HTTP 400 with a structured errors array on failure.
 *
 * @param {import('joi').Schema} schema - Joi schema to validate against
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

module.exports = validate;
