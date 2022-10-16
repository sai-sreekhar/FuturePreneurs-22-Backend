const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  roundThreeValidationSchema: (body) => {
    const Schema = Joi.object({
      operation: Joi.number().required(),
      item: Joi.string().required(),
    });
    return Schema.validate(body);
  },
};
