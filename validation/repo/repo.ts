import {celebrate, Joi, Segments} from "celebrate";

export function signup() {
    return celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().required(),
            age: Joi.number().integer(),
            role: Joi.string().default('admin')
        }),
        [Segments.QUERY]: {
            token: Joi.string().token().required()
        }
    })
}
