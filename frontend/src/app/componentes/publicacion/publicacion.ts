import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Publicacion } from '../../servicios/publicaciones.service';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.scss'
})
export class PublicacionComponent {
  @Input({ required: true }) publicacion!: Publicacion;
  @Input() usuarioActualId: string = '';
  @Input() esAdmin: boolean = false;

  @Output() like = new EventEmitter<string>();
  @Output() unlike = new EventEmitter<string>();
  @Output() eliminar = new EventEmitter<string>();

  get esAutor(): boolean {
    return this.publicacion.autor._id === this.usuarioActualId;
  }

  get yaDioLike(): boolean {
    return this.publicacion.likes?.includes(this.usuarioActualId) || false;
  }

  get puedeEliminar(): boolean {
    return this.esAutor || this.esAdmin;
  }

  toggleLike() {
    if (this.yaDioLike) {
      this.unlike.emit(this.publicacion._id);
    } else {
      this.like.emit(this.publicacion._id);
    }
  }

  onEliminar() {
    this.eliminar.emit(this.publicacion._id);
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
