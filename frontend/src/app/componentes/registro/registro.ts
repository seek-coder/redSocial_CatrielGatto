import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class RegistroComponent {

  // Solo letras (incluye acentos y ñ)
  private static readonly PATRON_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  // Email estricto: algo@algo.algo
  private static readonly PATRON_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  registroForm = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
      Validators.pattern(RegistroComponent.PATRON_NOMBRE)
    ]),
    apellido: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
      Validators.pattern(RegistroComponent.PATRON_NOMBRE)
    ]),
    correo: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(RegistroComponent.PATRON_EMAIL)
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
  }, { validators: this.validarPasswords });

  archivoImagen: File | null = null;
  previewImagen = signal<string | null>(null);
  errorImagen = signal('');
  mostrarModal = signal(false);
  mensajeModal = signal('');
  tipoModal = signal<'error' | 'exito'>('error');
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  get nombre() { return this.registroForm.get('nombre'); }
  get apellido() { return this.registroForm.get('apellido'); }
  get correo() { return this.registroForm.get('correo'); }
  get nombreUsuario() { return this.registroForm.get('nombreUsuario'); }
  get password() { return this.registroForm.get('password'); }
  get repetirPassword() { return this.registroForm.get('repetirPassword'); }
  get fechaNacimiento() { return this.registroForm.get('fechaNacimiento'); }
  get descripcion() { return this.registroForm.get('descripcion'); }

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
    if (edad < 13) {
      return { menorDeEdad: true };
    }
    if (nacimiento > hoy) {
      return { fechaFutura: true };
    }
    return null;
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    this.errorImagen.set('');

    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(archivo.type)) {
        this.errorImagen.set('Solo se permiten imágenes (JPG, PNG, GIF, WebP).');
        input.value = '';
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (archivo.size > 2 * 1024 * 1024) {
        this.errorImagen.set('La imagen no puede superar los 2MB.');
        input.value = '';
        return;
      }

      this.archivoImagen = archivo;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImagen.set(reader.result as string);
      };
      reader.readAsDataURL(this.archivoImagen);
    }
  }

  async onSubmit() {
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

    if (this.archivoImagen) {
      formData.append('imagenPerfil', this.archivoImagen);
    }

    const resultado = await this.auth.registrar(formData);

    this.cargando.set(false);

    if (resultado.ok) {
      this.tipoModal.set('exito');
      this.mensajeModal.set('Cuenta creada correctamente. Redirigiendo...');
      this.mostrarModal.set(true);
      setTimeout(() => this.router.navigate(['/publicaciones']), 1500);
    } else {
      this.tipoModal.set('error');
      this.mensajeModal.set(resultado.mensaje);
      this.mostrarModal.set(true);
    }
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.mensajeModal.set('');
  }
}

