import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://gatto99:gatto99@prograiv.naiqon7.mongodb.net/red-social?retryWrites=true&w=majority&appName=PrograIV'),
    AutenticacionModule,
    UsuariosModule,
    PublicacionesModule,
  ],
})
export class AppModule {}
