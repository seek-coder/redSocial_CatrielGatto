import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./componentes/login/login').then(m => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./componentes/registro/registro').then(m => m.RegistroComponent) },
  { path: 'publicaciones', loadComponent: () => import('./componentes/publicaciones/publicaciones').then(m => m.PublicacionesComponent) },
  { path: 'mi-perfil', loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfilComponent) },
  { path: '**', redirectTo: 'login' },
];
