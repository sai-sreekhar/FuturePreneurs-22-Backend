const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  createTeamBodyValidation: (body) => {
    const schema = Joi.object({
      teamName: Joi.string().required(),
    });
    return schema.validate(body);
  },

  updateTeamBodyValidation: (body) => {
    const Schema = Joi.object({
      teamName: Joi.string().required(),
    });
    return Schema.validate(body);
  },

  updateRequestBodyValidation: (body) => {
    const Schema = Joi.object({
      userId: Joi.string().required().length(objectIdLength),
      status: Joi.number().min(0).max(1),
    });
    return Schema.validate(body);
  },

  removeMemberBodyValidation: (body) => {
    const Schema = Joi.object({
      userId: Joi.string().required().length(objectIdLength),
    });
    return Schema.validate(body);
  },

  submitAnswerValidtionSchema: (body) => {
    const Schema = Joi.object({
      questionId: Joi.string().required().length(objectIdLength),
      submittedIdx: Joi.number(),
    });
    return Schema.validate(body);
  },
};
