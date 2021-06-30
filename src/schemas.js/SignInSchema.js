
import joi from 'joi';

const SignInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});

export { SignInSchema };