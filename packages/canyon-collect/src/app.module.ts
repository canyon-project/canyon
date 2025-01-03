import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { CollectModule } from "./apps/collect/collect.module";
import { PrismaService } from "./prisma/prisma.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoveragediskEntity } from "./apps/collect/entity/coveragedisk.entity";
import { AuthModule } from "./apps/auth/auth.module";
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "db/sql",
            synchronize: true,
            entities: [CoveragediskEntity],
        }),
        AuthModule,
        CollectModule,
    ],
    controllers: [AppController],
    providers: [PrismaService],
})
export class AppModule {}
