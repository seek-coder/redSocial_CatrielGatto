import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('imagen', {
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
    @Body() body: { titulo: string; mensaje: string; autorId: string },
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    let imagenBase64 = '';
    if (archivo) {
      const base64 = archivo.buffer.toString('base64');
      imagenBase64 = `data:${archivo.mimetype};base64,${base64}`;
    }
    return this.publicacionesService.crear({
      titulo: body.titulo,
      mensaje: body.mensaje,
      imagen: imagenBase64,
      autorId: body.autorId,
    });
  }

  @Get()
  async obtener(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('orden') orden?: string,
    @Query('usuario') usuario?: string,
  ) {
    return this.publicacionesService.obtener({
      offset: offset ? parseInt(offset) : 0,
      limit: limit ? parseInt(limit) : 10,
      orden: orden || 'fecha',
      usuario,
    });
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.publicacionesService.obtenerPorId(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @Param('id') id: string,
    @Body() body: { usuarioId: string; perfil: string },
  ) {
    return this.publicacionesService.eliminar(id, body.usuarioId, body.perfil);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.CREATED)
  async darLike(
    @Param('id') id: string,
    @Body() body: { usuarioId: string },
  ) {
    return this.publicacionesService.darLike(id, body.usuarioId);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async quitarLike(
    @Param('id') id: string,
    @Body() body: { usuarioId: string },
  ) {
    return this.publicacionesService.quitarLike(id, body.usuarioId);
  }
}
