// raw-body.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// body-parser.middleware.ts
import * as bodyParser from 'body-parser';
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    bodyParser.json()(req, res, (errJson) => {
      if (errJson) {
        // Handle JSON parsing error
        console.error('Error parsing JSON:', errJson);
      }

      bodyParser.raw({ type: 'text/plain' })(req, res, (errRaw) => {
        if (errRaw) {
          // Handle raw text parsing error
          console.error('Error parsing raw text:', errRaw);
        }

        next();
      });
    });
  }
}
