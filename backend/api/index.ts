import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: any;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create(AppModule);

    cachedApp.enableCors({
      origin: [
        'https://redsocial-dionisos-frontend.vercel.app',
        'https://red-social-catriel-gatto.vercel.app',
        'http://localhost:4200',
      ],
      credentials: true,
    });

    cachedApp.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    await cachedApp.init();
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  const app = await getApp();
  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
};
