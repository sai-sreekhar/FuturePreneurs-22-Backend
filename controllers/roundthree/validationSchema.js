const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  roundThreeValidationVerifySchema: (body) => {
    const RoundThreeSchema = Joi.object({
      operation: Joi.string().required(),
      item: Joi.string().required(),
      price: Joi.number().required(),
    });
    return RoundThreeSchema.validate(body);
  },
};
