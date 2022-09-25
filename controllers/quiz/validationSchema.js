const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  submitAnswerValidtionSchema: (body) => {
    const Schema = Joi.object({
      questionId: Joi.string().required().length(objectIdLength),
      submittedIdx: Joi.number(),
    });
    return Schema.validate(body);
  },
};
