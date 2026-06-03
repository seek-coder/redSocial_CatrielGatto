import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './usuario.schema';
export declare class UsuariosService {
    private usuarioModel;
    constructor(usuarioModel: Model<UsuarioDocument>);
    crear(datos: Partial<Usuario>): Promise<UsuarioDocument>;
    buscarPorCorreo(correo: string): Promise<UsuarioDocument | null>;
    buscarPorNombreUsuario(nombreUsuario: string): Promise<UsuarioDocument | null>;
    buscarPorId(id: string): Promise<UsuarioDocument | null>;
    existeCorreo(correo: string): Promise<boolean>;
    existeNombreUsuario(nombreUsuario: string): Promise<boolean>;
}
