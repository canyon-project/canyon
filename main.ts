import express from "express";
// import {AppDataSource} from "./data-source";
import api from './handler/api/api'
import { prepareInit } from './utils/prepareInit'

async function bootstrap() {
    // import {AppDataSource} from "./data-source";
    const {AppDataSource} = await import('./data-source')
    AppDataSource.initialize().then(async (MyDataSource) => {
        const app = express();
        app.use(express.json());
        app.use('/', api.handler());
        app.listen(3001);
    });
}

bootstrap()



