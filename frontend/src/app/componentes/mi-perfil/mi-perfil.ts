import { Component } from '@angular/core';
import { AuthService, Usuario } from '../../servicios/auth.service';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss'
})
export class MiPerfilComponent {

  constructor(public auth: AuthService) {}

  obtenerUrlImagen(usuario: Usuario): string {
    return usuario.imagenPerfil || '';
  }
}
