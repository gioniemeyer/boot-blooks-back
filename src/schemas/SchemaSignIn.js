  
import joi from 'joi';

const SchemaSignIn = joi.object({
    email: joi.string().email().required(),    
    password: joi.string().required()
});

export { SchemaSignIn };