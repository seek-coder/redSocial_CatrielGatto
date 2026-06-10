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
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto, LoginDto } from './dto/autenticacion.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro')
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
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo para base64, sino rompe todo xd
    }),
  )
  async registro(
    @Body() registroDto: RegistroDto,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    // Concvierto la imagen a base64 data URL para guardar en MongoDB, más fácil
    let imagenBase64 = '';
    if (archivo) {
      const base64 = archivo.buffer.toString('base64');
      imagenBase64 = `data:${archivo.mimetype};base64,${base64}`;
    }
    const usuario = await this.autenticacionService.registrar(registroDto, imagenBase64);
    return { mensaje: 'Usuario registrado correctamente.', usuario };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const usuario = await this.autenticacionService.login(loginDto);
    return { mensaje: 'Login exitoso.', usuario };
  }
}
