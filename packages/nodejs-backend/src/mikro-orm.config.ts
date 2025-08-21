import { Logger } from '@nestjs/common';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { defineConfig } from '@mikro-orm/postgresql';
import {ConfigEntity} from "./entities/config.entity";

const logger = new Logger('MikroORM');

export default defineConfig({
  entities: [
    ConfigEntity
  ],
  clientUrl:process.env.DATABASE_URL,
  highlighter: new SqlHighlighter(),
  debug: true,
  logger: logger.log.bind(logger),
});
