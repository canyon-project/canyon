import express from "express";
import {AppDataSource} from "./data-source";
import api from './handler/api/api'

AppDataSource.initialize().then(async (MyDataSource) => {
    const app = express();
    app.use(express.json());
    app.use('/', api.handler());
    app.listen(3001);
});
