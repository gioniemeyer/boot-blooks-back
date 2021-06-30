
import joi from 'joi';

const SchemaSignUp = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),    
    password: joi.string().min(4).required()
});

export { SchemaSignUp };
