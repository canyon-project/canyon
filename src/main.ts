import { NestFactory } from '@nestjs/core'
import { prepareInit } from './utils/prepareInit'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  prepareInit()
  const { AppModule } = await import('./app.module')
  const app = await NestFactory.create(AppModule)
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
  app.use(function (req, res, next) {
    const old_url = req.url
    if (old_url.includes('/api')) {
      req.url = old_url.replace('/api', '')
    }
    next()
  })
  app.enableCors()
  await app.listen(8080)
}
bootstrap()
