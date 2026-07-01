import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, Usuario } from '../../servicios/auth.service';
import { PublicacionesService, Publicacion } from '../../servicios/publicaciones.service';
import { PublicacionComponent } from '../publicacion/publicacion';
import { ImagenFallbackDirective } from '../../directivas/imagen-fallback.directive';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [PublicacionComponent, ImagenFallbackDirective, FormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss'
})
export class MiPerfilComponent implements OnInit {

  misPublicaciones = signal<Publicacion[]>([]);

  mostrarModal = signal(false);
  mensajeModal = signal('');
  esError = signal(false);

  idAEliminar = signal<string | null>(null);

  modoEdicion = signal(false);
  guardando = signal(false);

  formEdicion = signal<{
    nombre: string;
    apellido: string;
    descripcion: string;
    fechaNacimiento: string;
    imagenPrevia: string | null;
    archivoImagen: File | null;
  }>({
    nombre: '',
    apellido: '',
    descripcion: '',
    fechaNacimiento: '',
    imagenPrevia: null,
    archivoImagen: null,
  });

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

  abrirEdicion() {
    const u = this.auth.usuario();
    if (!u) return;
    this.formEdicion.set({
      nombre: u.nombre,
      apellido: u.apellido,
      descripcion: u.descripcion,
      fechaNacimiento: u.fechaNacimiento,
      imagenPrevia: null,
      archivoImagen: null,
    });
    this.modoEdicion.set(true);
  }

  cerrarEdicion() {
    this.modoEdicion.set(false);
  }

  onImagenSeleccionada(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.formEdicion.update(f => ({
        ...f,
        imagenPrevia: e.target?.result as string,
        archivoImagen: archivo,
      }));
    };
    reader.readAsDataURL(archivo);
  }

  guardarCambios() {
    const form = this.formEdicion();
    this.guardando.set(true);

    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('apellido', form.apellido);
    formData.append('descripcion', form.descripcion);
    formData.append('fechaNacimiento', form.fechaNacimiento);
    if (form.archivoImagen) {
      formData.append('imagenPerfil', form.archivoImagen);
    }

    this.auth.editarPerfil(formData).subscribe({
      next: (res) => {
        this.auth.actualizarUsuarioLocal(res.usuario as Usuario);
        this.guardando.set(false);
        this.modoEdicion.set(false);
        this.mostrarMensaje('Perfil actualizado correctamente.', false);
      },
      error: () => {
        this.guardando.set(false);
        this.mostrarMensaje('Error al actualizar el perfil.', true);
      }
    });
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
