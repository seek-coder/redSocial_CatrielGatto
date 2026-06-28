import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../servicios/publicaciones.service';
import { TruncarPipe } from '../../pipes/truncar.pipe';
import { FechaRelativaPipe } from '../../pipes/fecha-relativa.pipe';
import { ImagenFallbackDirective } from '../../directivas/imagen-fallback.directive';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [RouterLink, TruncarPipe, FechaRelativaPipe, ImagenFallbackDirective],
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
}
