import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {

  private apiUrl = `${environment.apiUrl}/estadisticas`;

  constructor(private http: HttpClient) {}

  publicacionesPorUsuario(fechaInicio: string, fechaFin: string) {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<{ usuario: string; cantidad: number }[]>(
      `${this.apiUrl}/publicaciones-por-usuario`, { params }
    );
  }

  comentariosTotales(fechaInicio: string, fechaFin: string) {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<{ fecha: string; cantidad: number }[]>(
      `${this.apiUrl}/comentarios-totales`, { params }
    );
  }

  comentariosPorPublicacion(fechaInicio: string, fechaFin: string) {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<{ publicacion: string; cantidad: number }[]>(
      `${this.apiUrl}/comentarios-por-publicacion`, { params }
    );
  }
}
