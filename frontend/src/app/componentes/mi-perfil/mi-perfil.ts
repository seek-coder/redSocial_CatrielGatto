import { Component } from '@angular/core';
import { AuthService, Usuario } from '../../servicios/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss'
})
export class MiPerfilComponent {

  apiUrl = environment.apiUrl;

  constructor(public auth: AuthService) {}

  obtenerUrlImagen(usuario: Usuario): string {
    if (!usuario.imagenPerfil) return '';
    if (usuario.imagenPerfil.startsWith('http')) return usuario.imagenPerfil;
    return `${this.apiUrl}/${usuario.imagenPerfil}`;
  }
}
