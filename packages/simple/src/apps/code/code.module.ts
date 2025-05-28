import { Module } from '@nestjs/common';
import { CodeController } from './code.controller';
// import { PrismaService } from '../prisma/prisma.service';
import { CodeService } from './code.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {SimpleCoverage} from "../coverage/entities/simple-coverage.entity";
import {SimpleGitProvider} from "./entities/simple-git-provider.entity";
// import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [TypeOrmModule.forFeature([SimpleGitProvider])],
  controllers: [CodeController],
  providers: [CodeService],
})
export class CodeModule {}
