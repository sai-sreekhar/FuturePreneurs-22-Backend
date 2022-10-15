const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  roundOneValidationMapSchema: (body) => {
    const RoundOneSchema = Joi.object({
      mapChoice: Joi.number().required(),
    });
    return RoundOneSchema.validate(body);
  },
  // roundOneValidationCategorySchema: (body) => {
  //     const RoundOneSchema = Joi.object({
  //         mapChoice: Joi.string().required(),
  //     });
  //     return RoundOneSchema.validate(body);
  // },
};
