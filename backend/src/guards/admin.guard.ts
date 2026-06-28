import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.['token'];

    if (!token) {
      throw new UnauthorizedException('No se encontró el token.');
    }

    try {
      const payload = this.jwtService.verify(token);
      if (payload.perfil !== 'administrador') {
        throw new ForbiddenException('Acceso restringido a administradores.');
      }
      request.usuario = payload;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}
