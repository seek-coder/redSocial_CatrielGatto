import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Comentario {
  _id: string;
  publicacion: string;
  autor: {
    _id: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    imagenPerfil: string;
  };
  mensaje: string;
  modificado: boolean;
  createdAt: string;
}

export interface RespuestaComentarios {
  comentarios: Comentario[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ComentariosService {

  private apiUrl = `${environment.apiUrl}/comentarios`;

  constructor(private http: HttpClient) {}

  obtener(publicacionId: string, offset: number, limit: number) {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<RespuestaComentarios>(`${this.apiUrl}/${publicacionId}`, { params });
  }

  crear(publicacionId: string, mensaje: string) {
    return this.http.post<Comentario>(this.apiUrl, { publicacionId, mensaje });
  }

  editar(comentarioId: string, mensaje: string) {
    return this.http.put<Comentario>(`${this.apiUrl}/${comentarioId}`, { mensaje });
  }
}
