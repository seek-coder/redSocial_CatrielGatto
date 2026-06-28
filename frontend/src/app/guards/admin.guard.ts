import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.usuario();

  if (usuario && usuario.perfil === 'administrador') {
    return true;
  }

  router.navigate(['/publicaciones']);
  return false;
};
