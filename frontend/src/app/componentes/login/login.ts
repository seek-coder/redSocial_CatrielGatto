import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  loginForm = new FormGroup({
    identificador: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]),
  });

  mostrarModal = signal(false);
  mensajeModal = signal('');
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  get identificador() { return this.loginForm.get('identificador'); }
  get password() { return this.loginForm.get('password'); }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.cargando.set(true);

    const resultado = await this.auth.login(
      this.identificador!.value!,
      this.password!.value!
    );

    this.cargando.set(false);

    if (resultado.ok) {
      this.router.navigate(['/publicaciones']);
    } else {
      this.mensajeModal.set(resultado.mensaje);
      this.mostrarModal.set(true);
    }
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.mensajeModal.set('');
  }
}
