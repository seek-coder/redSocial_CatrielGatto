import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'dionisos_clave_secreta_2024',
      signOptions: { expiresIn: '1m' },
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
  exports: [JwtModule, AutenticacionService],
})
export class AutenticacionModule {}
