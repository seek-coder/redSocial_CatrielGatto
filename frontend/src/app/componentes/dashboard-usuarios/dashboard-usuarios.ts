import { Component, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UsuariosAdminService, UsuarioAdmin } from '../../servicios/usuarios-admin.service';
import { CapitalizarRolPipe } from '../../pipes/capitalizar-rol.pipe';
import { EstadoUsuarioDirective } from '../../directivas/estado-usuario.directive';
import { ResaltarHoverDirective } from '../../directivas/resaltar-hover.directive';
import { ImagenFallbackDirective } from '../../directivas/imagen-fallback.directive';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CapitalizarRolPipe,
    EstadoUsuarioDirective,
    ResaltarHoverDirective,
    ImagenFallbackDirective,
  ],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.scss'
})
export class DashboardUsuariosComponent implements OnInit {

  private static readonly PATRON_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  private static readonly PATRON_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  usuarios = signal<UsuarioAdmin[]>([]);
  mostrarFormulario = signal(false);
  cargando = signal(false);

  mostrarModal = signal(false);
  mensajeModal = signal('');
  tipoModal = signal<'exito' | 'error'>('exito');

  idAccion = signal<string | null>(null);
  accionPendiente = signal<'habilitar' | 'deshabilitar' | null>(null);

  archivoImagen: File | null = null;
  previewImagen = signal<string | null>(null);
  errorImagen = signal('');

  registroForm = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
      Validators.pattern(DashboardUsuariosComponent.PATRON_NOMBRE)
    ]),
    apellido: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
      Validators.pattern(DashboardUsuariosComponent.PATRON_NOMBRE)
    ]),
    correo: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(DashboardUsuariosComponent.PATRON_EMAIL)
    ]),
    nombreUsuario: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9_]+$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(50),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]),
    repetirPassword: new FormControl('', [Validators.required]),
    fechaNacimiento: new FormControl('', [Validators.required, this.validarEdadMinima]),
    descripcion: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(200)
    ]),
    perfil: new FormControl('usuario', [Validators.required]),
  }, { validators: this.validarPasswords });

  constructor(private usuariosService: UsuariosAdminService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  get nombre() { return this.registroForm.get('nombre'); }
  get apellido() { return this.registroForm.get('apellido'); }
  get correo() { return this.registroForm.get('correo'); }
  get nombreUsuario() { return this.registroForm.get('nombreUsuario'); }
  get password() { return this.registroForm.get('password'); }
  get repetirPassword() { return this.registroForm.get('repetirPassword'); }
  get fechaNacimiento() { return this.registroForm.get('fechaNacimiento'); }
  get descripcion() { return this.registroForm.get('descripcion'); }
  get perfil() { return this.registroForm.get('perfil'); }

  validarPasswords(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const repetir = group.get('repetirPassword')?.value;
    if (pass && repetir && pass !== repetir) {
      return { passwordsDistintas: true };
    }
    return null;
  }

  validarEdadMinima(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const hoy = new Date();
    const nacimiento = new Date(control.value);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - nacimiento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    if (edad < 13) return { menorDeEdad: true };
    if (nacimiento > hoy) return { fechaFutura: true };
    return null;
  }

  cargarUsuarios() {
    this.usuariosService.listar().subscribe({
      next: (lista) => this.usuarios.set(lista),
      error: () => this.mostrarMensajeModal('Error al cargar usuarios.', 'error'),
    });
  }

  toggleFormulario() {
    this.mostrarFormulario.update(v => !v);
    if (!this.mostrarFormulario()) {
      this.registroForm.reset({ perfil: 'usuario' });
      this.archivoImagen = null;
      this.previewImagen.set(null);
    }
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    this.errorImagen.set('');

    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(archivo.type)) {
        this.errorImagen.set('Solo se permiten imágenes (JPG, PNG, GIF, WebP).');
        input.value = '';
        return;
      }

      if (archivo.size > 2 * 1024 * 1024) {
        this.errorImagen.set('La imagen no puede superar los 2MB.');
        input.value = '';
        return;
      }

      this.archivoImagen = archivo;
      const reader = new FileReader();
      reader.onload = () => this.previewImagen.set(reader.result as string);
      reader.readAsDataURL(this.archivoImagen);
    }
  }

  crearUsuario() {
    if (this.registroForm.invalid) return;

    this.cargando.set(true);
    const formData = new FormData();
    formData.append('nombre', this.nombre!.value!.trim());
    formData.append('apellido', this.apellido!.value!.trim());
    formData.append('correo', this.correo!.value!.trim().toLowerCase());
    formData.append('nombreUsuario', this.nombreUsuario!.value!.trim());
    formData.append('password', this.password!.value!);
    formData.append('fechaNacimiento', this.fechaNacimiento!.value!);
    formData.append('descripcion', this.descripcion!.value!.trim());
    formData.append('perfil', this.perfil!.value!);

    if (this.archivoImagen) {
      formData.append('imagenPerfil', this.archivoImagen);
    }

    this.usuariosService.crear(formData).subscribe({
      next: () => {
        this.cargando.set(false);
        this.mostrarFormulario.set(false);
        this.registroForm.reset({ perfil: 'usuario' });
        this.archivoImagen = null;
        this.previewImagen.set(null);
        this.cargarUsuarios();
        this.mostrarMensajeModal('Usuario creado correctamente.', 'exito');
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err.error?.message || 'Error al crear el usuario.';
        this.mostrarMensajeModal(msg, 'error');
      },
    });
  }

  pedirConfirmacion(id: string, accion: 'habilitar' | 'deshabilitar') {
    this.idAccion.set(id);
    this.accionPendiente.set(accion);
  }

  cancelarAccion() {
    this.idAccion.set(null);
    this.accionPendiente.set(null);
  }

  confirmarAccion() {
    const id = this.idAccion();
    const accion = this.accionPendiente();
    if (!id || !accion) return;

    const obs = accion === 'deshabilitar'
      ? this.usuariosService.deshabilitar(id)
      : this.usuariosService.habilitar(id);

    obs.subscribe({
      next: () => {
        this.idAccion.set(null);
        this.accionPendiente.set(null);
        this.cargarUsuarios();
      },
      error: () => {
        this.idAccion.set(null);
        this.accionPendiente.set(null);
        this.mostrarMensajeModal('Error al realizar la acción.', 'error');
      },
    });
  }

  mostrarMensajeModal(msg: string, tipo: 'exito' | 'error') {
    this.mensajeModal.set(msg);
    this.tipoModal.set(tipo);
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }
}
