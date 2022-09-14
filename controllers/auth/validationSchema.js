const Joi = require("joi");

module.exports = {
  signUpBodyValidation: (body) => {
    const schema = Joi.object({
      username: Joi.string().min(4).required(),
      password: Joi.string().min(6).required(),
      email: Joi.string().email().required(),
    });
    return schema.validate(body);
  },

  logInBodyValidation: (body) => {
    const schema = Joi.object({
      username: Joi.string().min(4).required(),
      password: Joi.string().min(6).required(),
    });
    return schema.validate(body);
  },

  refreshTokenBodyValidation: (body) => {
    const schema = Joi.object({
      refreshToken: Joi.string().required(),
    });
    return schema.validate(body);
  },

  googleAuthBodyValidation: (body) => {
    const schema = Joi.object({
      token: Joi.string().required(),
      email: Joi.string().email().required(),
    });
    return schema.validate(body);
  },
};
