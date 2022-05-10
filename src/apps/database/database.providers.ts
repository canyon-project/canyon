import { createConnection } from 'typeorm'
import * as mongoose from 'mongoose'
const { datasource } = global.conf
const { mysql, mongodb } = datasource
console.log(mysql,'mysql')
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () =>
      await createConnection({
        type: mysql.type,
        host: mysql.host,
        port: mysql.port,
        username: mysql.username,
        password: mysql.password,
        database: mysql.database,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        // charset:'utf8mb4'
        // mysql数据库编码使用utf8mb4_general_ci
      }),
  },
]

export const mongodbProviders = [
  {
    provide: 'MONGODB_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        `mongodb://${mongodb.username}:${mongodb.password}@${mongodb.host}:${mongodb.port}/${mongodb.database}`,
      ),
  },
]
