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
  private timerSesion: any = null;
  private timerExpiracion: any = null;

  mostrarModalSesion = signal(false);

  usuario = computed(() => this.usuarioActual());
  estaLogueado = computed(() => this.usuarioActual() !== null);
  esAdmin = computed(() => this.usuarioActual()?.perfil === 'administrador');

  constructor(private http: HttpClient, private router: Router) {}

  login(identificador: string, password: string): Promise<{ ok: boolean; mensaje: string }> {
    return new Promise((resolve) => {
      this.http.post<any>(`${environment.apiUrl}/autenticacion/login`, {
        identificador,
        password
      }).subscribe({
        next: (res) => {
          this.usuarioActual.set(res.usuario);
          this.iniciarTimerSesion();
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
          this.iniciarTimerSesion();
          resolve({ ok: true, mensaje: '' });
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al registrarse.';
          resolve({ ok: false, mensaje: msg });
        }
      });
    });
  }

  autorizar(): Promise<{ ok: boolean; usuario?: any }> {
    return new Promise((resolve) => {
      this.http.post<any>(`${environment.apiUrl}/autenticacion/autorizar`, {}).subscribe({
        next: (res) => {
          this.usuarioActual.set(res);
          this.iniciarTimerSesion();
          resolve({ ok: true, usuario: res });
        },
        error: () => {
          this.usuarioActual.set(null);
          resolve({ ok: false });
        }
      });
    });
  }

  extenderSesion() {
    this.http.post<any>(`${environment.apiUrl}/autenticacion/refrescar`, {}).subscribe({
      next: () => {
        this.mostrarModalSesion.set(false);
        this.iniciarTimerSesion();
      },
      error: () => {
        this.cerrarSesion();
      }
    });
  }

  cerrarSesion() {
    this.limpiarTimers();
    this.mostrarModalSesion.set(false);
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  private iniciarTimerSesion() {
    this.limpiarTimers();

    this.timerSesion = setTimeout(() => {
      this.mostrarModalSesion.set(true);

      this.timerExpiracion = setTimeout(() => {
        this.cerrarSesion();
      }, 30 * 1000); // A los 30 segundos expira, para que el profe pueda verificarlo mejor y más rápido
    }, 30 * 1000); // Muestra el modal a los 30 segundos, para lo mismo
  }

  private limpiarTimers() {
    if (this.timerSesion) {
      clearTimeout(this.timerSesion);
      this.timerSesion = null;
    }
    if (this.timerExpiracion) {
      clearTimeout(this.timerExpiracion);
      this.timerExpiracion = null;
    }
  }
}
