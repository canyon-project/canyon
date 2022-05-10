import express from "express";
import repo from "./repo";
// const { celebrate, Joi, errors, Segments } = require('celebrate');
import { celebrate, Joi, errors, Segments } from 'celebrate'
import {signup as validationRepoSignup} from "../../validation/repo/repo";
import {oauthToken as validationUserOauthToken} from "../../validation/user";
import {oauthHandler} from "./user/oauth";

const validation = {
    repo:{
        signup:validationRepoSignup
    },
    user:{
        oauthToken:validationUserOauthToken
    }
}

const handler = {
    user:{
        oauthHandler
    }
}

const router = express.Router();

router.post('/oauth/token',validation.user.oauthToken(),handler.user.oauthHandler)
router.get('/repo',repo.update)




router.post('/signup', validation.repo.signup(), (req, res) => {
    res.send({a:1})
});

export default {
    handler:()=>router
}
