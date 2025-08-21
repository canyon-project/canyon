import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChModule } from './modules/ch/ch.module';
import { HealthController } from './controllers/health.controller';
import { CoverageModule } from './modules/coverage/coverage.module';
import { RepoModule } from './modules/repo/repo.module';
import { CodeModule } from './modules/code/code.module';
import { RootController } from './controllers/root.controller';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import {OrmModule} from "./modules/orm/orm.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OrmModule,
    ChModule,
    CoverageModule,
    RepoModule,
    CodeModule,
    SystemConfigModule
  ],
  controllers: [RootController, HealthController]
})
export class AppModule {}


