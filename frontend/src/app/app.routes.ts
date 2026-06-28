import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./componentes/carga/carga').then(m => m.CargaComponent) },
  { path: 'login', loadComponent: () => import('./componentes/login/login').then(m => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./componentes/registro/registro').then(m => m.RegistroComponent) },
  { path: 'publicaciones', loadComponent: () => import('./componentes/publicaciones/publicaciones').then(m => m.PublicacionesComponent) },
  { path: 'publicacion/:id', loadComponent: () => import('./componentes/detalle-publicacion/detalle-publicacion').then(m => m.DetallePublicacionComponent) },
  { path: 'mi-perfil', loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfilComponent) },
  {
    path: 'dashboard/usuarios',
    loadComponent: () => import('./componentes/dashboard-usuarios/dashboard-usuarios').then(m => m.DashboardUsuariosComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'dashboard/estadisticas',
    loadComponent: () => import('./componentes/dashboard-estadisticas/dashboard-estadisticas').then(m => m.DashboardEstadisticasComponent),
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: '' },
];
