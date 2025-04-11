import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      code: 200,
      message: 'success',
      data: {
        name: 'Canyon Platform',
        version: '1.0.0',
        description: 'A platform for building applications',
      },
    }
  }
}
