const Joi = require("joi");

module.exports = {
  setQuestionBodyValidation: (body) => {
    const schema = Joi.object({
      setNum: Joi.number().required(),
      questionNum: Joi.number().required(),
      questionType: Joi.number().required(),
      caseStudy: Joi.string(),
      question: Joi.array().items(Joi.string()),
      options: Joi.array().items(Joi.string()),
      correctIdxs: Joi.array().items(Joi.number()),
    });
    return schema.validate(body);
  },

  modifyQuestionBodyValidation: (body) => {
    const schema = Joi.object({
      question: Joi.string().required(),
      answers: Joi.array().items(Joi.string()).min(4),
      correctIndex: Joi.number(),
    });
    return schema.validate(body);
  },

  setEndTimeBodyValidation: (body) => {
    const schema = Joi.object({
      minutes: Joi.number(),
    });
    return schema.validate(body);
  },
};
