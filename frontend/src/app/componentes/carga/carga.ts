import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-carga',
  standalone: true,
  imports: [],
  templateUrl: './carga.html',
  styleUrl: './carga.scss'
})
export class CargaComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.auth.estaLogueado()) {
      this.router.navigate(['/publicaciones']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
