import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen: string;
  autor: {
    _id: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    imagenPerfil: string;
  };
  likes: string[];
  cantidadLikes: number;
  activa: boolean;
  createdAt: string;
}

export interface RespuestaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {

  private apiUrl = `${environment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient) {}

  obtener(offset: number, limit: number, orden: string, usuario?: string) {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('orden', orden);

    if (usuario) {
      params = params.set('usuario', usuario);
    }

    return this.http.get<RespuestaPublicaciones>(this.apiUrl, { params });
  }

  obtenerPorId(id: string) {
    return this.http.get<Publicacion>(`${this.apiUrl}/${id}`);
  }

  crear(formData: FormData) {
    return this.http.post<Publicacion>(this.apiUrl, formData);
  }

  eliminar(publicacionId: string, usuarioId: string, perfil: string) {
    return this.http.delete(`${this.apiUrl}/${publicacionId}`, {
      body: { usuarioId, perfil }
    });
  }

  darLike(publicacionId: string, usuarioId: string) {
    return this.http.post<{ mensaje: string; cantidadLikes: number }>(
      `${this.apiUrl}/${publicacionId}/like`,
      { usuarioId }
    );
  }

  quitarLike(publicacionId: string, usuarioId: string) {
    return this.http.delete<{ mensaje: string; cantidadLikes: number }>(
      `${this.apiUrl}/${publicacionId}/like`,
      { body: { usuarioId } }
    );
  }
}
