import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { RequestMethod } from '@nestjs/common'
import * as dotenv from 'dotenv'
import path from 'node:path'
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
})
async function bootstrap(): Promise<void> {
  const { AppModule } = await import('./app.module.js')
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const port = Number(config.get('PORT') ?? 8080)
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'vi/health', method: RequestMethod.GET }],
  })
  app.enableCors()
  await app.listen(port)
}

bootstrap()
