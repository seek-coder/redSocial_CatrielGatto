import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto, LoginDto } from './dto/autenticacion.dto';

@Injectable()
export class AutenticacionService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

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

    const token = this.generarToken(usuarioObj);
    return { usuario: usuarioObj, token };
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

    if (usuario.activo === false) {
      throw new UnauthorizedException('Cuenta deshabilitada. Contactá al administrador.');
    }

    const usuarioObj = usuario.toObject();
    delete usuarioObj.password;

    const token = this.generarToken(usuarioObj);
    return { usuario: usuarioObj, token };
  }

  validarToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }

  async autorizarYObtenerUsuario(token: string) {
    const payload = this.validarToken(token);
    const usuario = await this.usuariosService.buscarPorId(payload.sub);
    if (!usuario || usuario.activo === false) {
      throw new UnauthorizedException('Sesión inválida o cuenta deshabilitada.');
    }
    const obj = usuario.toObject();
    delete obj.password;
    return obj;
  }

  async editarPerfil(
    usuarioId: string,
    datos: { nombre?: string; apellido?: string; descripcion?: string; fechaNacimiento?: string },
    imagenUrl?: string,
  ) {
    const actualizacion: any = {};
    if (datos.nombre) actualizacion.nombre = datos.nombre;
    if (datos.apellido) actualizacion.apellido = datos.apellido;
    if (datos.descripcion !== undefined) actualizacion.descripcion = datos.descripcion;
    if (datos.fechaNacimiento) actualizacion.fechaNacimiento = datos.fechaNacimiento;
    if (imagenUrl) actualizacion.imagenPerfil = imagenUrl;

    const usuario = await this.usuariosService.actualizar(usuarioId, actualizacion);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return usuario;
  }

  refrescarToken(payload: any) {
    const nuevoPayload = {
      sub: payload.sub,
      correo: payload.correo,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    };
    return this.jwtService.sign(nuevoPayload);
  }

  private generarToken(usuario: any): string {
    const payload = {
      sub: usuario._id.toString(),
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return this.jwtService.sign(payload);
  }
}
