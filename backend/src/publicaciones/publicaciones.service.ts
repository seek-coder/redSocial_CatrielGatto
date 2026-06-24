import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './publicacion.schema';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
  ) {}

  async crear(datos: { titulo: string; mensaje: string; imagen: string; autorId: string }) {
    const nueva = new this.publicacionModel({
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      imagen: datos.imagen,
      autor: new Types.ObjectId(datos.autorId),
    });
    const guardada = await nueva.save();
    return this.publicacionModel
      .findById(guardada._id)
      .populate('autor', '-password')
      .exec();
  }

  async obtener(query: { offset?: number; limit?: number; orden?: string; usuario?: string }) {
    const filtro: any = { activa: true };

    if (query.usuario) {
      filtro.autor = new Types.ObjectId(query.usuario);
    }

    let sort: any = { createdAt: -1 };
    if (query.orden === 'likes') {
      sort = { cantidadLikes: -1, createdAt: -1 };
    }

    const offset = query.offset || 0;
    const limit = query.limit || 10;

    const publicaciones = await this.publicacionModel
      .find(filtro)
      .populate('autor', '-password')
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .exec();

    const total = await this.publicacionModel.countDocuments(filtro);

    const resultado = publicaciones.map((pub) => {
      const obj = pub.toObject();
      const likesComoStrings = obj.likes ? obj.likes.map((id: any) => id.toString()) : [];
      return {
        ...obj,
        likes: likesComoStrings,
        cantidadLikes: likesComoStrings.length,
      };
    });

    if (query.orden === 'likes') {
      resultado.sort((a, b) => b.cantidadLikes - a.cantidadLikes);
    }

    return { publicaciones: resultado, total };
  }

  async obtenerPorId(publicacionId: string) {
    const publicacion = await this.publicacionModel
      .findById(publicacionId)
      .populate('autor', '-password')
      .exec();

    if (!publicacion || !publicacion.activa) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const obj = publicacion.toObject();
    const likesComoStrings = obj.likes ? obj.likes.map((id: any) => id.toString()) : [];
    return {
      ...obj,
      likes: likesComoStrings,
      cantidadLikes: likesComoStrings.length,
    };
  }

  async eliminar(publicacionId: string, usuarioId: string, perfilUsuario: string) {
    const publicacion = await this.publicacionModel.findById(publicacionId);
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const esAutor = publicacion.autor.toString() === usuarioId;
    const esAdmin = perfilUsuario === 'administrador';

    if (!esAutor && !esAdmin) {
      throw new UnauthorizedException('No tenés permiso para eliminar esta publicación.');
    }

    publicacion.activa = false;
    await publicacion.save();
    return { mensaje: 'Publicación eliminada.' };
  }

  async darLike(publicacionId: string, usuarioId: string) {
    const publicacion = await this.publicacionModel.findById(publicacionId);
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const uid = new Types.ObjectId(usuarioId);
    const yaDioLike = publicacion.likes.some((id) => id.toString() === usuarioId);

    if (yaDioLike) {
      throw new BadRequestException('Ya le diste Me Gusta a esta publicación.');
    }

    publicacion.likes.push(uid);
    await publicacion.save();

    return { mensaje: 'Like agregado.', cantidadLikes: publicacion.likes.length };
  }

  async quitarLike(publicacionId: string, usuarioId: string) {
    const publicacion = await this.publicacionModel.findById(publicacionId);
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const yaDioLike = publicacion.likes.some((id) => id.toString() === usuarioId);

    if (!yaDioLike) {
      throw new BadRequestException('No le habías dado Me Gusta a esta publicación.');
    }

    publicacion.likes = publicacion.likes.filter((id) => id.toString() !== usuarioId);
    await publicacion.save();

    return { mensaje: 'Like eliminado.', cantidadLikes: publicacion.likes.length };
  }
}
