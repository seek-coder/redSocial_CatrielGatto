import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as express from 'express';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto, LoginDto } from './dto/autenticacion.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 15 * 60 * 1000,
  path: '/',
};

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
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async registro(
    @Body() registroDto: RegistroDto,
    @UploadedFile() archivo: Express.Multer.File,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    let imagenBase64 = '';
    if (archivo) {
      const base64 = archivo.buffer.toString('base64');
      imagenBase64 = `data:${archivo.mimetype};base64,${base64}`;
    }
    const resultado = await this.autenticacionService.registrar(registroDto, imagenBase64);
    res.cookie('token', resultado.token, COOKIE_OPTIONS);
    return { mensaje: 'Usuario registrado correctamente.', usuario: resultado.usuario };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const resultado = await this.autenticacionService.login(loginDto);
    res.cookie('token', resultado.token, COOKIE_OPTIONS);
    return { mensaje: 'Login exitoso.', usuario: resultado.usuario };
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  async autorizar(@Req() req: express.Request) {
    const token = req.cookies?.['token'];
    if (!token) {
      throw new UnauthorizedException('No se encontró el token.');
    }
    const payload = this.autenticacionService.validarToken(token);
    return {
      _id: payload.sub,
      correo: payload.correo,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    };
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  async refrescar(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const token = req.cookies?.['token'];
    if (!token) {
      throw new UnauthorizedException('No se encontró el token.');
    }
    const payload = this.autenticacionService.validarToken(token);
    const nuevoToken = this.autenticacionService.refrescarToken(payload);
    res.cookie('token', nuevoToken, COOKIE_OPTIONS);
    return { mensaje: 'Sesión extendida.' };
  }
}
