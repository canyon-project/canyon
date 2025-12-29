import { Module } from '@nestjs/common';
import { CodeController } from './code.controller';
// import { CodeResolver } from './code.resolver';
import { CodeService } from './service/code.service';

@Module({
  imports: [],
  controllers: [CodeController],
  providers: [CodeService],
})
export class CodeModule {}
