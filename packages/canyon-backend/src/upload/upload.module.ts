import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { RawBodyMiddleware } from './raw-body.middleware';

@Module({
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.PUT });
  }
}
