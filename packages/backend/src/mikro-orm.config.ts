import { defineConfig } from '@mikro-orm/postgresql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Logger } from '@nestjs/common';
import { ConfigEntity } from './entities/config.entity';
import { CoverageEntity } from './entities/coverage.entity';
import { CoverageMapRelationEntity } from './entities/coverage-map-relation.entity';
import { RepoEntity } from './entities/repo.entity';

const logger = new Logger('MikroORM');

export default defineConfig({
  entities: [
    ConfigEntity,
    CoverageEntity,
    CoverageMapRelationEntity,
    RepoEntity,
  ],
  clientUrl: process.env.DATABASE_URL,
  highlighter: new SqlHighlighter(),
  debug: true,
  logger: logger.log.bind(logger),
  // allowGlobalContext: true,
  // mikro+app.setGlobalPrefix+graphql会报错，不知道为什么！
  // app.setGlobalPrefix('api', {
  //   // exclude: [{ path: 'vi/health', method: RequestMethod.GET }],
  // });
});
