const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  roundTwoBoxChoiceValidationSchema: (body) => {
    const Schema = Joi.object({
      boxChoice: Joi.number().required(),
    });
    return Schema.validate(body);
  },
};
