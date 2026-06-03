import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss'
})
export class PublicacionesComponent {
  constructor(public auth: AuthService) {}
}
