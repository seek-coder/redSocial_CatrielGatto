"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutenticacionService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const usuarios_service_1 = require("../usuarios/usuarios.service");
let AutenticacionService = class AutenticacionService {
    usuariosService;
    constructor(usuariosService) {
        this.usuariosService = usuariosService;
    }
    async registrar(datos, rutaImagen) {
        const existeCorreo = await this.usuariosService.existeCorreo(datos.correo);
        if (existeCorreo) {
            throw new common_1.BadRequestException('El correo ya está registrado.');
        }
        const existeUsuario = await this.usuariosService.existeNombreUsuario(datos.nombreUsuario);
        if (existeUsuario) {
            throw new common_1.BadRequestException('El nombre de usuario ya está en uso.');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(datos.password, salt);
        const usuario = await this.usuariosService.crear({
            nombre: datos.nombre,
            apellido: datos.apellido,
            correo: datos.correo,
            nombreUsuario: datos.nombreUsuario,
            password: passwordEncriptada,
            fechaNacimiento: datos.fechaNacimiento,
            descripcion: datos.descripcion,
            imagenPerfil: rutaImagen,
            perfil: 'usuario',
        });
        const usuarioObj = usuario.toObject();
        delete usuarioObj.password;
        return usuarioObj;
    }
    async login(datos) {
        let usuario = await this.usuariosService.buscarPorCorreo(datos.identificador);
        if (!usuario) {
            usuario = await this.usuariosService.buscarPorNombreUsuario(datos.identificador);
        }
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos.');
        }
        const passwordValida = await bcrypt.compare(datos.password, usuario.password);
        if (!passwordValida) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos.');
        }
        const usuarioObj = usuario.toObject();
        delete usuarioObj.password;
        return usuarioObj;
    }
};
exports.AutenticacionService = AutenticacionService;
exports.AutenticacionService = AutenticacionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usuarios_service_1.UsuariosService])
], AutenticacionService);
//# sourceMappingURL=autenticacion.service.js.map