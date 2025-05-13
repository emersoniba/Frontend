import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ProyectoComponent } from './modules/boletas/proyecto/proyecto.component';
import { BoletaComponent } from './modules/boletas/boleta/boleta.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent) },
  {
    path: '', loadComponent: () => import('./modules/layout/principal.component').then(m => m.PrincipalComponent), canActivate: [AuthGuard],
    children: [
      {
        path: 'persona',
        loadComponent: () => import('./modules/boletas/persona/persona.component').then(m => m.PersonaComponent)
      },
      {
        path: 'empresa',
        loadComponent: () => import('./modules/boletas/empresa/empresa.component').then(m => m.EmpresaComponent)
      },
      {
        path: 'boleta',
        loadComponent: () => import('./modules/boletas/boleta/boleta.component').then(m => m.BoletaComponent)
      },
      {
        path: 'proyecto',
        loadComponent: () => import('./modules/boletas/proyecto/proyecto.component').then(m => m.ProyectoComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'login' },


  { path: 'proyectos', component: ProyectoComponent },
  { path: '', redirectTo: 'proyectos', pathMatch: 'full' },
  { path: 'boletas', component: BoletaComponent }

];

