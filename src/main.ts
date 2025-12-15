import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { json } from 'express';
import { AppModule } from './app.module';
const SERVICE_PREFIX = 'storage';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });

  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(SERVICE_PREFIX);

  app.use(json({ limit: '50mb' }));
  await app.listen(process.env.PORT || 3000);
  Logger.log(`Service is running on: ${await app.getUrl()}`);
}
bootstrap();
