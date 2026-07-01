import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsuariosService } from './usuarios.service';
import { AdminGuard } from '../guards/admin.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcryptjs';

@Controller('usuarios')
@UseGuards(AdminGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async listar() {
    return this.usuariosService.listarTodos();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('Solo se permiten imágenes.'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async crear(
    @Body()
    body: {
      nombre: string;
      apellido: string;
      correo: string;
      nombreUsuario: string;
      password: string;
      fechaNacimiento: string;
      descripcion: string;
      perfil: string;
    },
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    const existeCorreo = await this.usuariosService.existeCorreo(body.correo);
    if (existeCorreo) {
      throw new BadRequestException('El correo ya está registrado.');
    }

    const existeUsuario = await this.usuariosService.existeNombreUsuario(body.nombreUsuario);
    if (existeUsuario) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }

    const perfilValido = ['usuario', 'administrador'];
    if (!perfilValido.includes(body.perfil)) {
      throw new BadRequestException('Perfil inválido. Debe ser "usuario" o "administrador".');
    }

    let imagenUrl = '';
    if (archivo) {
      imagenUrl = await this.cloudinaryService.subirImagen(archivo);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(body.password, salt);

    const usuario = await this.usuariosService.crear({
      nombre: body.nombre,
      apellido: body.apellido,
      correo: body.correo,
      nombreUsuario: body.nombreUsuario,
      password: passwordEncriptada,
      fechaNacimiento: body.fechaNacimiento,
      descripcion: body.descripcion,
      imagenPerfil: imagenUrl,
      perfil: body.perfil,
    });

    const obj = usuario.toObject();
    delete obj.password;
    return { mensaje: 'Usuario creado correctamente.', usuario: obj };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deshabilitar(@Param('id') id: string) {
    const usuario = await this.usuariosService.deshabilitarUsuario(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return { mensaje: 'Usuario deshabilitado correctamente.', usuario };
  }

  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  async habilitar(@Param('id') id: string) {
    const usuario = await this.usuariosService.habilitarUsuario(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return { mensaje: 'Usuario habilitado correctamente.', usuario };
  }
}
