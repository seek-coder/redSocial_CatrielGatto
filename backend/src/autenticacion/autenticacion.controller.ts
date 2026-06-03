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
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto, LoginDto } from './dto/autenticacion.dto';

const esVercel = !!process.env['VERCEL'];

const almacenamiento = esVercel
  ? memoryStorage()
  : diskStorage({
      destination: (_req, _file, cb) => {
        const dir = './uploads/perfiles';
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const nombre = Date.now() + '-' + Math.round(Math.random() * 1e6);
        cb(null, nombre + extname(file.originalname));
      },
    });

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: almacenamiento,
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
    let rutaImagen = '';
    if (archivo) {
      if (esVercel) {
        // En Vercel guardamos en /tmp (efímero)
        const nombre = Date.now() + '-' + Math.round(Math.random() * 1e6) + extname(archivo.originalname);
        const tmpPath = join('/tmp', nombre);
        writeFileSync(tmpPath, archivo.buffer);
        rutaImagen = `tmp/${nombre}`;
      } else {
        rutaImagen = `uploads/perfiles/${archivo.filename}`;
      }
    }
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
