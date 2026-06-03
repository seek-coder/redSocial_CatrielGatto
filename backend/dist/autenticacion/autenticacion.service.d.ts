import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto, LoginDto } from './dto/autenticacion.dto';
export declare class AutenticacionService {
    private usuariosService;
    constructor(usuariosService: UsuariosService);
    registrar(datos: RegistroDto, rutaImagen: string): Promise<any>;
    login(datos: LoginDto): Promise<any>;
}
