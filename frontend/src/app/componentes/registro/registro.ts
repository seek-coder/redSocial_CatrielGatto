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

  registroForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2)]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    nombreUsuario: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z0-9_]+$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]),
    repetirPassword: new FormControl('', [Validators.required]),
    fechaNacimiento: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required, Validators.maxLength(200)]),
  }, { validators: this.validarPasswords });

  archivoImagen: File | null = null;
  previewImagen = signal<string | null>(null);
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

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoImagen = input.files[0];

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
    formData.append('nombre', this.nombre!.value!);
    formData.append('apellido', this.apellido!.value!);
    formData.append('correo', this.correo!.value!);
    formData.append('nombreUsuario', this.nombreUsuario!.value!);
    formData.append('password', this.password!.value!);
    formData.append('fechaNacimiento', this.fechaNacimiento!.value!);
    formData.append('descripcion', this.descripcion!.value!);

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
