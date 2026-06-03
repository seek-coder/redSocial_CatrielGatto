import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface Usuario {
  _id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil: string;
  perfil: 'usuario' | 'administrador';
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private usuarioActual = signal<Usuario | null>(null);

  usuario = computed(() => this.usuarioActual());
  estaLogueado = computed(() => this.usuarioActual() !== null);

  constructor(private http: HttpClient, private router: Router) {
    const guardado = localStorage.getItem('usuario');
    if (guardado) {
      this.usuarioActual.set(JSON.parse(guardado));
    }
  }

  login(identificador: string, password: string): Promise<{ ok: boolean; mensaje: string }> {
    return new Promise((resolve) => {
      this.http.post<any>(`${environment.apiUrl}/autenticacion/login`, {
        identificador,
        password
      }).subscribe({
        next: (res) => {
          this.usuarioActual.set(res.usuario);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          resolve({ ok: true, mensaje: '' });
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al iniciar sesión.';
          resolve({ ok: false, mensaje: msg });
        }
      });
    });
  }

  registrar(formData: FormData): Promise<{ ok: boolean; mensaje: string }> {
    return new Promise((resolve) => {
      this.http.post<any>(`${environment.apiUrl}/autenticacion/registro`, formData).subscribe({
        next: (res) => {
          this.usuarioActual.set(res.usuario);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          resolve({ ok: true, mensaje: '' });
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al registrarse.';
          resolve({ ok: false, mensaje: msg });
        }
      });
    });
  }

  cerrarSesion() {
    this.usuarioActual.set(null);
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
