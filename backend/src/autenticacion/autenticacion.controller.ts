import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto, LoginDto } from './dto/autenticacion.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (_req, file, cb) => {
          const nombre = Date.now() + '-' + Math.round(Math.random() * 1e6);
          cb(null, nombre + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('Solo se permiten imágenes.'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async registro(
    @Body() registroDto: RegistroDto,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    const rutaImagen = archivo ? `uploads/perfiles/${archivo.filename}` : '';
    const usuario = await this.autenticacionService.registrar(registroDto, rutaImagen);
    return { mensaje: 'Usuario registrado correctamente.', usuario };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const usuario = await this.autenticacionService.login(loginDto);
    return { mensaje: 'Login exitoso.', usuario };
  }
}
