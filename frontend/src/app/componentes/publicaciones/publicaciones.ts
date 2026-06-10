import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { PublicacionesService, Publicacion } from '../../servicios/publicaciones.service';
import { PublicacionComponent } from '../publicacion/publicacion';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [FormsModule, PublicacionComponent],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss'
})
export class PublicacionesComponent implements OnInit {

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  orden = signal<'fecha' | 'likes'>('fecha');
  paginaActual = signal(0);
  limite = 5;

  mostrarFormulario = signal(false);
  nuevoTitulo = '';
  nuevoMensaje = '';
  nuevaImagen: File | null = null;
  enviando = signal(false);

  mostrarModal = signal(false);
  mensajeModal = signal('');
  esError = signal(false);

  idAEliminar = signal<string | null>(null);

  totalPaginas = computed(() => Math.ceil(this.total() / this.limite));
  hayAnterior = computed(() => this.paginaActual() > 0);
  haySiguiente = computed(() => (this.paginaActual() + 1) < this.totalPaginas());

  constructor(
    public auth: AuthService,
    private pubService: PublicacionesService
  ) {}

  ngOnInit() {
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    const offset = this.paginaActual() * this.limite;
    this.pubService.obtener(offset, this.limite, this.orden()).subscribe({
      next: (res) => {
        this.publicaciones.set(res.publicaciones);
        this.total.set(res.total);
      },
      error: () => {
        this.mostrarMensaje('Error al cargar publicaciones.', true);
      }
    });
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    this.orden.set(nuevoOrden);
    this.paginaActual.set(0);
    this.cargarPublicaciones();
  }

  paginaAnterior() {
    if (this.hayAnterior()) {
      this.paginaActual.update(p => p - 1);
      this.cargarPublicaciones();
    }
  }

  paginaSiguiente() {
    if (this.haySiguiente()) {
      this.paginaActual.update(p => p + 1);
      this.cargarPublicaciones();
    }
  }

  toggleFormulario() {
    this.mostrarFormulario.update(v => !v);
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.nuevaImagen = input.files[0];
    }
  }

  crearPublicacion() {
    const usuario = this.auth.usuario();
    if (!usuario || !this.nuevoTitulo.trim() || !this.nuevoMensaje.trim()) return;

    this.enviando.set(true);
    const formData = new FormData();
    formData.append('titulo', this.nuevoTitulo.trim());
    formData.append('mensaje', this.nuevoMensaje.trim());
    formData.append('autorId', usuario._id!);

    if (this.nuevaImagen) {
      formData.append('imagen', this.nuevaImagen);
    }

    this.pubService.crear(formData).subscribe({
      next: () => {
        this.nuevoTitulo = '';
        this.nuevoMensaje = '';
        this.nuevaImagen = null;
        this.mostrarFormulario.set(false);
        this.enviando.set(false);
        this.paginaActual.set(0);
        this.orden.set('fecha');
        this.cargarPublicaciones();
      },
      error: () => {
        this.enviando.set(false);
        this.mostrarMensaje('Error al crear la publicación.', true);
      }
    });
  }

  onLike(publicacionId: string) {
    const usuario = this.auth.usuario();
    if (!usuario) return;

    this.pubService.darLike(publicacionId, usuario._id!).subscribe({
      next: (res) => {
        this.publicaciones.update(pubs =>
          pubs.map(p => p._id === publicacionId
            ? { ...p, likes: [...p.likes, usuario._id!], cantidadLikes: res.cantidadLikes }
            : p
          )
        );
      },
      error: () => {
        this.mostrarMensaje('Error al dar Me Gusta.', true);
      }
    });
  }

  onUnlike(publicacionId: string) {
    const usuario = this.auth.usuario();
    if (!usuario) return;

    this.pubService.quitarLike(publicacionId, usuario._id!).subscribe({
      next: (res) => {
        this.publicaciones.update(pubs =>
          pubs.map(p => p._id === publicacionId
            ? { ...p, likes: p.likes.filter(id => id !== usuario._id!), cantidadLikes: res.cantidadLikes }
            : p
          )
        );
      },
      error: () => {
        this.mostrarMensaje('Error al quitar Me Gusta.', true);
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
        this.cargarPublicaciones();
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
