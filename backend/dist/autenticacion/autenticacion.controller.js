"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutenticacionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const autenticacion_service_1 = require("./autenticacion.service");
const autenticacion_dto_1 = require("./dto/autenticacion.dto");
let AutenticacionController = class AutenticacionController {
    autenticacionService;
    constructor(autenticacionService) {
        this.autenticacionService = autenticacionService;
    }
    async registro(registroDto, archivo) {
        const rutaImagen = archivo ? `uploads/perfiles/${archivo.filename}` : '';
        const usuario = await this.autenticacionService.registrar(registroDto, rutaImagen);
        return { mensaje: 'Usuario registrado correctamente.', usuario };
    }
    async login(loginDto) {
        const usuario = await this.autenticacionService.login(loginDto);
        return { mensaje: 'Login exitoso.', usuario };
    }
};
exports.AutenticacionController = AutenticacionController;
__decorate([
    (0, common_1.Post)('registro'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagenPerfil', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/perfiles',
            filename: (_req, file, cb) => {
                const nombre = Date.now() + '-' + Math.round(Math.random() * 1e6);
                cb(null, nombre + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                cb(new Error('Solo se permiten imágenes.'), false);
            }
            else {
                cb(null, true);
            }
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [autenticacion_dto_1.RegistroDto, Object]),
    __metadata("design:returntype", Promise)
], AutenticacionController.prototype, "registro", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [autenticacion_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AutenticacionController.prototype, "login", null);
exports.AutenticacionController = AutenticacionController = __decorate([
    (0, common_1.Controller)('autenticacion'),
    __metadata("design:paramtypes", [autenticacion_service_1.AutenticacionService])
], AutenticacionController);
//# sourceMappingURL=autenticacion.controller.js.map