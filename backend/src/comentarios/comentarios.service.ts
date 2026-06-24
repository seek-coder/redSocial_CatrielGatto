import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './comentario.schema';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
  ) {}

  async crear(datos: { publicacionId: string; mensaje: string; autorId: string }) {
    const nuevo = new this.comentarioModel({
      publicacion: new Types.ObjectId(datos.publicacionId),
      autor: new Types.ObjectId(datos.autorId),
      mensaje: datos.mensaje,
    });
    const guardado = await nuevo.save();
    return this.comentarioModel
      .findById(guardado._id)
      .populate('autor', '-password')
      .exec();
  }

  async obtenerPorPublicacion(publicacionId: string, offset: number, limit: number) {
    const filtro = { publicacion: new Types.ObjectId(publicacionId) };

    const comentarios = await this.comentarioModel
      .find(filtro)
      .populate('autor', '-password')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    const total = await this.comentarioModel.countDocuments(filtro);

    return { comentarios, total };
  }

  async editar(comentarioId: string, mensaje: string, autorId: string) {
    const comentario = await this.comentarioModel.findById(comentarioId);
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado.');
    }

    if (comentario.autor.toString() !== autorId) {
      throw new UnauthorizedException('Solo el autor puede editar este comentario.');
    }

    comentario.mensaje = mensaje;
    comentario.modificado = true;
    await comentario.save();

    return this.comentarioModel
      .findById(comentarioId)
      .populate('autor', '-password')
      .exec();
  }
}
