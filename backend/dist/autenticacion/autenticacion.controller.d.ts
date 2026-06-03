import { AutenticacionService } from './autenticacion.service';
import { RegistroDto, LoginDto } from './dto/autenticacion.dto';
export declare class AutenticacionController {
    private readonly autenticacionService;
    constructor(autenticacionService: AutenticacionService);
    registro(registroDto: RegistroDto, archivo: Express.Multer.File): Promise<{
        mensaje: string;
        usuario: any;
    }>;
    login(loginDto: LoginDto): Promise<{
        mensaje: string;
        usuario: any;
    }>;
}
