import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);

  const reqConCredenciales = req.clone({
    withCredentials: true,
  });

  return next(reqConCredenciales).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const esRutaDeAuth = req.url.includes('/autenticacion/login') ||
                             req.url.includes('/autenticacion/registro') ||
                             req.url.includes('/autenticacion/autorizar');

        if (!esRutaDeAuth) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
