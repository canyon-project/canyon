import { Connection } from 'typeorm'
import { Connection as MongoConnection } from 'mongoose'
import { Coverage } from '../entities/coverage.entity'
import { CoverageSchema } from '../schema/coverage.schema'
import { Repo } from '../entities/repo.entity'
import {User} from "../../auth/entities/user.entity";
export const coverageProviders = [
  {
    provide: 'DATABASE_CONNECTION_CoverageRepository',
    useFactory: (connection: Connection) => connection.getRepository(Coverage),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'MONGODB_CONNECTION_CoverageRepository',
    useFactory: (connection: MongoConnection) =>
      connection.model(
        'canyon_coverage_model',
        CoverageSchema,
        'canyon_coverage',
      ),
    inject: ['MONGODB_CONNECTION'],
  },
  {
    provide: 'DATABASE_CONNECTION_RepoRepository',
    useFactory: (connection: Connection) => connection.getRepository(Repo),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: 'user_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(User),
    inject: ['DATABASE_CONNECTION'],
  },
]
