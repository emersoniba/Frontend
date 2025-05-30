import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule, AllCommunityModule]);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./modules/layout/principal.component').then(m => m.PrincipalComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'proyecto',
        pathMatch: 'full'
      },
      {
        path: 'persona',
        loadComponent: () =>
          import('./modules/boletas/persona/persona.component').then(m => m.PersonaComponent)
      },
      {
        path: 'empresa',
        loadComponent: () =>
          import('./modules/boletas/empresa/empresa.component').then(m => m.EmpresaComponent)
      },
      {
        path: 'boleta',
        loadComponent: () => import('./modules/boletas/boleta/boleta.component').then(m => m.BoletaComponent)
      },
      {
        path: 'proyecto',
        loadComponent: () =>
          import('./modules/boletas/proyecto/proyecto.component').then(m => m.ProyectoComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
