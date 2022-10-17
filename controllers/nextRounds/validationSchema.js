const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  nextRoundsValidationSchema: (body) => {
    const Schema = Joi.object({
      nextRound: Joi.number().required(),
    });
    return Schema.validate(body);
  },
};
