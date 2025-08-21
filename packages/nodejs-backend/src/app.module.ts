import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PgModule } from './modules/pg/pg.module';
import { ChModule } from './modules/ch/ch.module';
import { HealthController } from './controllers/health.controller';
import { ProjectEntity } from './entities/project.entity';
import { CoverageModule } from './modules/coverage/coverage.module';
import { RepoModule } from './modules/repo/repo.module';
import { CodeModule } from './modules/code/code.module';
import { RootController } from './controllers/root.controller';
import { SystemConfigModule } from './modules/system-config/system-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRootAsync({
      useFactory: () => ({
        driver: PostgreSqlDriver,
        clientUrl: process.env.DATABASE_URL,
        entities: [ProjectEntity]
      })
    }),
    PgModule,
    ChModule,
    CoverageModule,
    RepoModule,
    CodeModule,
    SystemConfigModule
  ],
  controllers: [RootController, HealthController]
})
export class AppModule {}


