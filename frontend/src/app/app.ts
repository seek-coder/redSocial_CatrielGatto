import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './componentes/navbar/navbar';
import { AuthService } from './servicios/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'red-social';

  constructor(public auth: AuthService) {}

  extenderSesion() {
    this.auth.extenderSesion();
  }

  rechazarExtension() {
    this.auth.cerrarSesion();
  }
}
