import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    const expressApp = new ExpressAdapter(server);
    app = await NestFactory.create(AppModule, expressApp);

    app.enableCors({
      origin: process.env['FRONTEND_URL'] || 'http://localhost:4200',
      credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    await app.init();
  }
  return server;
}

export default async (req: any, res: any) => {
  const svr = await bootstrap();
  svr(req, res);
};
