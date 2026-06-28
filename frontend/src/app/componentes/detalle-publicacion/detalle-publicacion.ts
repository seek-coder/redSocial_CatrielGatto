import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { PublicacionesService, Publicacion } from '../../servicios/publicaciones.service';
import { ComentariosService, Comentario } from '../../servicios/comentarios.service';
import { FechaRelativaPipe } from '../../pipes/fecha-relativa.pipe';
import { ImagenFallbackDirective } from '../../directivas/imagen-fallback.directive';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [FormsModule, RouterLink, FechaRelativaPipe, ImagenFallbackDirective],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.scss'
})
export class DetallePublicacionComponent implements OnInit {

  publicacion = signal<Publicacion | null>(null);
  comentarios = signal<Comentario[]>([]);
  totalComentarios = signal(0);
  limiteComentarios = 5;
  offsetComentarios = signal(0);

  nuevoComentario = '';
  enviando = signal(false);

  editandoId = signal<string | null>(null);
  textoEdicion = '';

  mostrarModal = signal(false);
  mensajeModal = signal('');
  esError = signal(false);

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private pubService: PublicacionesService,
    private comentariosService: ComentariosService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPublicacion(id);
      this.cargarComentarios(id);
    }
  }

  cargarPublicacion(id: string) {
    this.pubService.obtenerPorId(id).subscribe({
      next: (pub) => this.publicacion.set(pub),
      error: () => this.mostrarMensaje('Error al cargar la publicación.', true)
    });
  }

  cargarComentarios(publicacionId: string) {
    this.comentariosService.obtener(publicacionId, 0, this.limiteComentarios).subscribe({
      next: (res) => {
        this.comentarios.set(res.comentarios);
        this.totalComentarios.set(res.total);
        this.offsetComentarios.set(res.comentarios.length);
      },
      error: () => this.mostrarMensaje('Error al cargar comentarios.', true)
    });
  }

  cargarMas() {
    const pub = this.publicacion();
    if (!pub) return;

    this.comentariosService.obtener(pub._id, this.offsetComentarios(), this.limiteComentarios).subscribe({
      next: (res) => {
        this.comentarios.update(actuales => [...actuales, ...res.comentarios]);
        this.offsetComentarios.update(o => o + res.comentarios.length);
      }
    });
  }

  get hayMasComentarios(): boolean {
    return this.offsetComentarios() < this.totalComentarios();
  }

  enviarComentario() {
    const pub = this.publicacion();
    if (!pub || !this.nuevoComentario.trim()) return;

    this.enviando.set(true);

    this.comentariosService.crear(pub._id, this.nuevoComentario.trim()).subscribe({
      next: (nuevo) => {
        this.comentarios.update(c => [nuevo, ...c]);
        this.totalComentarios.update(t => t + 1);
        this.offsetComentarios.update(o => o + 1);
        this.nuevoComentario = '';
        this.enviando.set(false);
      },
      error: () => {
        this.enviando.set(false);
        this.mostrarMensaje('Error al enviar el comentario.', true);
      }
    });
  }

  iniciarEdicion(comentario: Comentario) {
    this.editandoId.set(comentario._id);
    this.textoEdicion = comentario.mensaje;
  }

  cancelarEdicion() {
    this.editandoId.set(null);
    this.textoEdicion = '';
  }

  guardarEdicion(comentarioId: string) {
    if (!this.textoEdicion.trim()) return;

    this.comentariosService.editar(comentarioId, this.textoEdicion.trim()).subscribe({
      next: (editado) => {
        this.comentarios.update(lista =>
          lista.map(c => c._id === comentarioId ? editado : c)
        );
        this.editandoId.set(null);
        this.textoEdicion = '';
      },
      error: () => this.mostrarMensaje('Error al editar el comentario.', true)
    });
  }

  onLike() {
    const pub = this.publicacion();
    const usuario = this.auth.usuario();
    if (!pub || !usuario) return;

    this.pubService.darLike(pub._id, usuario._id!).subscribe({
      next: (res) => {
        this.publicacion.update(p => p ? {
          ...p,
          likes: [...p.likes, usuario._id!],
          cantidadLikes: res.cantidadLikes
        } : p);
      }
    });
  }

  onUnlike() {
    const pub = this.publicacion();
    const usuario = this.auth.usuario();
    if (!pub || !usuario) return;

    this.pubService.quitarLike(pub._id, usuario._id!).subscribe({
      next: (res) => {
        this.publicacion.update(p => p ? {
          ...p,
          likes: p.likes.filter(id => id !== usuario._id!),
          cantidadLikes: res.cantidadLikes
        } : p);
      }
    });
  }

  get yaDioLike(): boolean {
    const pub = this.publicacion();
    const usuario = this.auth.usuario();
    if (!pub || !usuario) return false;
    return pub.likes?.includes(usuario._id!) || false;
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
