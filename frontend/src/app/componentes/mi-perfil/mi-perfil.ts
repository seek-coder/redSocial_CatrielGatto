import { Component, signal, OnInit } from '@angular/core';
import { AuthService, Usuario } from '../../servicios/auth.service';
import { PublicacionesService, Publicacion } from '../../servicios/publicaciones.service';
import { PublicacionComponent } from '../publicacion/publicacion';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [PublicacionComponent],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss'
})
export class MiPerfilComponent implements OnInit {

  misPublicaciones = signal<Publicacion[]>([]);

  mostrarModal = signal(false);
  mensajeModal = signal('');
  esError = signal(false);

  idAEliminar = signal<string | null>(null);

  constructor(
    public auth: AuthService,
    private pubService: PublicacionesService
  ) {}

  ngOnInit() {
    this.cargarMisPublicaciones();
  }

  cargarMisPublicaciones() {
    const usuario = this.auth.usuario();
    if (!usuario?._id) return;

    this.pubService.obtener(0, 3, 'fecha', usuario._id).subscribe({
      next: (res) => {
        this.misPublicaciones.set(res.publicaciones);
      }
    });
  }

  obtenerUrlImagen(usuario: Usuario): string {
    return usuario.imagenPerfil || '';
  }

  onLike(publicacionId: string) {
    const usuario = this.auth.usuario();
    if (!usuario) return;

    this.pubService.darLike(publicacionId, usuario._id!).subscribe({
      next: (res) => {
        this.misPublicaciones.update(pubs =>
          pubs.map(p => p._id === publicacionId
            ? { ...p, likes: [...p.likes, usuario._id!], cantidadLikes: res.cantidadLikes }
            : p
          )
        );
      }
    });
  }

  onUnlike(publicacionId: string) {
    const usuario = this.auth.usuario();
    if (!usuario) return;

    this.pubService.quitarLike(publicacionId, usuario._id!).subscribe({
      next: (res) => {
        this.misPublicaciones.update(pubs =>
          pubs.map(p => p._id === publicacionId
            ? { ...p, likes: p.likes.filter(id => id !== usuario._id!), cantidadLikes: res.cantidadLikes }
            : p
          )
        );
      }
    });
  }

  pedirConfirmacion(publicacionId: string) {
    this.idAEliminar.set(publicacionId);
  }

  cancelarEliminar() {
    this.idAEliminar.set(null);
  }

  confirmarEliminar() {
    const id = this.idAEliminar();
    const usuario = this.auth.usuario();
    if (!id || !usuario) return;

    this.pubService.eliminar(id, usuario._id!, usuario.perfil).subscribe({
      next: () => {
        this.idAEliminar.set(null);
        this.cargarMisPublicaciones();
        this.mostrarMensaje('Publicación eliminada.', false);
      },
      error: () => {
        this.idAEliminar.set(null);
        this.mostrarMensaje('Error al eliminar.', true);
      }
    });
  }

  mostrarMensaje(msg: string, error: boolean) {
    this.mensajeModal.set(msg);
    this.esError.set(error);
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }
}
