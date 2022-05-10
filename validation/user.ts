import {celebrate, Joi, Segments} from "celebrate";

export function oauthToken() {
    return celebrate({
        [Segments.BODY]: Joi.object().keys({
            code: Joi.string().required(),
        }),
    })
}
