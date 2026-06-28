import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

let cachedApp: any;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create<NestExpressApplication>(AppModule);
    
    cachedApp.use(cookieParser());

    cachedApp.enableCors({
      origin: [
        'https://redsocial-dionisos-frontend.vercel.app',
        'https://red-social-catriel-gatto.vercel.app',
        'http://localhost:4200',
      ],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
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
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://redsocial-dionisos-frontend.vercel.app');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    return res.status(200).end();
  }

  const app = await getApp();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};
