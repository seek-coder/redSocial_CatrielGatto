import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env['MONGODB_URI'] || 'mongodb+srv://gatto99:gatto99@prograiv.naiqon7.mongodb.net/red-social?retryWrites=true&w=majority&appName=PrograIV'),
    CloudinaryModule,
    AutenticacionModule,
    UsuariosModule,
    PublicacionesModule,
    ComentariosModule,
  ],
})
export class AppModule {}
