import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './publicacion.schema';
import { Comentario, ComentarioDocument } from '../comentarios/comentario.schema';
import { AdminGuard } from '../guards/admin.guard';

@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
  ) {}

  @Get('publicaciones-por-usuario')
  async publicacionesPorUsuario(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    const filtro: any = { activa: true };

    if (fechaInicio && fechaFin) {
      filtro.createdAt = {
        $gte: new Date(fechaInicio),
        $lte: new Date(new Date(fechaFin).setHours(23, 59, 59, 999)),
      };
    }

    const resultado = await this.publicacionModel.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$autor',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuario: '$usuario.nombreUsuario',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);

    return resultado;
  }

  @Get('comentarios-totales')
  async comentariosTotales(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    const filtro: any = {};

    if (fechaInicio && fechaFin) {
      filtro.createdAt = {
        $gte: new Date(fechaInicio),
        $lte: new Date(new Date(fechaFin).setHours(23, 59, 59, 999)),
      };
    }

    const resultado = await this.comentarioModel.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          fecha: '$_id',
          cantidad: 1,
        },
      },
    ]);

    return resultado;
  }

  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    const filtro: any = {};

    if (fechaInicio && fechaFin) {
      filtro.createdAt = {
        $gte: new Date(fechaInicio),
        $lte: new Date(new Date(fechaFin).setHours(23, 59, 59, 999)),
      };
    }

    const resultado = await this.comentarioModel.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$publicacion',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'publicacions',
          localField: '_id',
          foreignField: '_id',
          as: 'pub',
        },
      },
      { $unwind: { path: '$pub', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          publicacion: { $ifNull: ['$pub.titulo', 'Publicación eliminada'] },
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
      { $limit: 10 },
    ]);

    return resultado;
  }
}
