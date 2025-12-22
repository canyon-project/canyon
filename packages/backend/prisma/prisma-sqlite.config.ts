import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'schema-sqlite.prisma',
  datasource: {
    url: 'file:local.db',
  },
});
