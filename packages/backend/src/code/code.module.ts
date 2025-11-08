import { Module } from '@nestjs/common';
import { CodeResolver } from './code.resolver';
import { CodeService } from './service/code.service';

@Module({
  imports: [],
  providers: [CodeService, CodeResolver],
})
export class CodeModule {}
