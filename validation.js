//validation
const Joi = require("joi");
require("dotenv").config();

//address validation
const method = (value, helpers) => {
    if (isNaN(value)) {
        throw new Error("Value must contain only digits");
    }
    return value;
};

const addressValidation = data => {
  const schema = Joi.object({
      city:Joi.string().required(),
      street:Joi.string().required(),
      postalcode: Joi.string().min(5).required().custom(method, "code").messages({

      }),
      number:Joi.number().integer().greater(0).required(),
      numberAddition:Joi.string().allow('').required()
  });

  return schema.validate(data);
};

const patchAddressValidation = data => {
  const schema = Joi.object({
      status:Joi.string().valid("not at home", "not interested","interested").required(),
      name:Joi.string(),
      email: Joi.string().strip().required().email()
  });

  return schema.validate(data);
};



module.exports = {
  addressValidation,
    patchAddressValidation
};
