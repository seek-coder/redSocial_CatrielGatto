import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface UsuarioAdmin {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfil: string;
  perfil: 'usuario' | 'administrador';
  activo: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<UsuarioAdmin[]>(this.apiUrl);
  }

  crear(formData: FormData) {
    return this.http.post<{ mensaje: string; usuario: UsuarioAdmin }>(this.apiUrl, formData);
  }

  deshabilitar(id: string) {
    return this.http.delete<{ mensaje: string; usuario: UsuarioAdmin }>(`${this.apiUrl}/${id}`);
  }

  habilitar(id: string) {
    return this.http.post<{ mensaje: string; usuario: UsuarioAdmin }>(`${this.apiUrl}/${id}/activar`, {});
  }
}
