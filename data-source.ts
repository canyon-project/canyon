import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./model/User"
import {prepareInit} from "./utils/prepareInit";

prepareInit()

console.log('biao2',global.conf)
const { datasource } = global.conf
const { mysql, mongodb } = datasource
console.log(__dirname,'__dirname')
export const AppDataSource = new DataSource({
    type: mysql.type,
    host: mysql.host,
    port: mysql.port,
    username: mysql.username,
    password: mysql.password,
    database: mysql.database,
    entities: [__dirname + '/model/*{.ts,.js}'],
    }
)
