import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto, LoginDto } from './dto/autenticacion.dto';

@Injectable()
export class AutenticacionService {
  constructor(private usuariosService: UsuariosService) {}

  async registrar(datos: RegistroDto, rutaImagen: string) {
    const existeCorreo = await this.usuariosService.existeCorreo(datos.correo);
    if (existeCorreo) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    const existeUsuario = await this.usuariosService.existeNombreUsuario(datos.nombreUsuario);
    if (existeUsuario) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(datos.password, salt);

    const usuario = await this.usuariosService.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      nombreUsuario: datos.nombreUsuario,
      password: passwordEncriptada,
      fechaNacimiento: datos.fechaNacimiento,
      descripcion: datos.descripcion,
      imagenPerfil: rutaImagen,
      perfil: 'usuario',
    });

    const usuarioObj = usuario.toObject();
    delete usuarioObj.password;
    return usuarioObj;
  }

  async login(datos: LoginDto) {
    let usuario = await this.usuariosService.buscarPorCorreo(datos.identificador);

    if (!usuario) {
      usuario = await this.usuariosService.buscarPorNombreUsuario(datos.identificador);
    }

    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const passwordValida = await bcrypt.compare(datos.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const usuarioObj = usuario.toObject();
    delete usuarioObj.password;
    return usuarioObj;
  }
}
