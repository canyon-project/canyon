import { errors } from "celebrate";
import express from "express";
import api from './handler/api/api'

async function bootstrap() {
    const {AppDataSource} = await import('./data-source')
    AppDataSource.initialize().then(async (MyDataSource) => {
        const app = express();
        app.use(express.json());
        app.use('/', api.handler());
        app.use(errors());
        app.listen(8080);
    });
}

bootstrap()



