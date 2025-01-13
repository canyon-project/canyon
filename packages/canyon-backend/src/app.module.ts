import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ProjectModule } from "./project/project.module";
import { CodechangeModule } from "./codechange/codechange.module";
import { SourcecodeController } from "./sourcecode/sourcecode.controller";
import { SourcecodeService } from "./sourcecode/sourcecode.service";
import { SourcecodeModule } from "./sourcecode/sourcecode.module";
import { join } from "path";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CoverageModule } from "./cov/coverage.module";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        AuthModule,
        UserModule,
        ProjectModule,
        PrismaModule,
        CoverageModule,
        CodechangeModule,
        SourcecodeModule,
        PrismaModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "../../canyon-platform", "dist"),
            exclude: ["/graphql/(.*)"],
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            autoSchemaFile: "schema.gql",
            driver: ApolloDriver,
            playground: false,
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
        }),
    ],
    controllers: [AppController, SourcecodeController],
    providers: [SourcecodeService],
})
export class AppModule {}
