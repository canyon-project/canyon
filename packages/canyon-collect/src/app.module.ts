import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CollectModule } from "./apps/collect/collect.module";
import { PrismaService } from "./prisma/prisma.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoveragediskEntity } from "./apps/collect/entity/coveragedisk.entity";
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "db/sql",
      synchronize: true,
      entities: [CoveragediskEntity],
    }),
    CollectModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
