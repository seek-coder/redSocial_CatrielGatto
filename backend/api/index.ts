import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: any;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create(AppModule);

    cachedApp.enableCors({
      origin: (origin: string, callback: Function) => {
        const permitidos = [
          'https://redsocial-dionisos-frontend.vercel.app',
          'https://red-social-catriel-gatto.vercel.app',
          'http://localhost:4200',
        ];
        // Aceptar URLs de preview de Vercel del proyecto
        if (!origin || permitidos.includes(origin) || origin.includes('seek-coders-projects.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Bloqueado por CORS'));
        }
      },
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
