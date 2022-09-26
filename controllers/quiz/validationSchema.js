const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  submitAnswerValidationSchema: (body) => {
    const Schema = Joi.object({
      setNum: Joi.number().required(),
      questionNum: Joi.number().required(),
      answerIdxs: Joi.array().items(Joi.number()).min(0).max(4),
      descriptiveAnswer: Joi.string(),
    });
    return Schema.validate(body);
  },
};
