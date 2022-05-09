import express from "express";
import repo from "./repo";

const router = express.Router();
router.get('/repo',repo.update)

export default {
    handler:()=>router
}
