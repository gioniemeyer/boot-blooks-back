import joi from 'joi';

const SchemaCart = joi.object({
    token: joi.string().required(),
    bookId: joi.number().required(),    
    quantity: joi.number().required()
});

export { SchemaCart };
