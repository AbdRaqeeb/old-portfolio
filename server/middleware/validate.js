import Joi from 'joi';

export  function validateMessage(message) {
    const schema = Joi.object({
        name: Joi.string().required().max(100),
        email: Joi.string().required().email().max(100),
        subject: Joi.string().required().max(100),
        message: Joi.string().required().max(300)
    });
    return schema.validate(message);
}