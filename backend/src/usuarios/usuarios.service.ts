import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async crear(datos: Partial<Usuario>): Promise<UsuarioDocument> {
    const nuevo = new this.usuarioModel(datos);
    return nuevo.save();
  }

  async buscarPorCorreo(correo: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ correo }).exec();
  }

  async buscarPorNombreUsuario(nombreUsuario: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ nombreUsuario }).exec();
  }

  async buscarPorId(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id).exec();
  }

  async existeCorreo(correo: string): Promise<boolean> {
    const usuario = await this.usuarioModel.findOne({ correo }).exec();
    return !!usuario;
  }

  async existeNombreUsuario(nombreUsuario: string): Promise<boolean> {
    const usuario = await this.usuarioModel.findOne({ nombreUsuario }).exec();
    return !!usuario;
  }
}
