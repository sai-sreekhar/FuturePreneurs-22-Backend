const Joi = require("joi");

module.exports = {
  updateUserBodyValidation: (body) => {
    const Schema = Joi.object({
      firstName: Joi.string(),
      lastName: Joi.string(),
      regNo: Joi.string(),
      mobileNumber: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/),
    });
    return Schema.validate(body);
  },

  joinTeamViaTokenBodyValidation: (body) => {
    const Schema = Joi.object({
      token: Joi.string().required(),
    });
    return Schema.validate(body);
  },
};
