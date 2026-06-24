import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as express from 'express';
import { ComentariosService } from './comentarios.service';

@Controller('comentarios')
export class ComentariosController {
  constructor(
    private readonly comentariosService: ComentariosService,
    private readonly jwtService: JwtService,
  ) {}

  private obtenerUsuarioDesdeToken(req: express.Request): any {
    const token = req.cookies?.['token'];
    if (!token) {
      throw new UnauthorizedException('No se encontró el token.');
    }
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @Req() req: express.Request,
    @Body() body: { publicacionId: string; mensaje: string },
  ) {
    const payload = this.obtenerUsuarioDesdeToken(req);
    return this.comentariosService.crear({
      publicacionId: body.publicacionId,
      mensaje: body.mensaje,
      autorId: payload.sub,
    });
  }

  @Get(':publicacionId')
  async obtener(
    @Param('publicacionId') publicacionId: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.comentariosService.obtenerPorPublicacion(
      publicacionId,
      offset ? parseInt(offset) : 0,
      limit ? parseInt(limit) : 5,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async editar(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() body: { mensaje: string },
  ) {
    const payload = this.obtenerUsuarioDesdeToken(req);
    return this.comentariosService.editar(id, body.mensaje, payload.sub);
  }
}
