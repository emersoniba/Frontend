import { Routes } from '@angular/router';
import { rolGuard } from './guards/rol.guard';
import { authGuard } from './guards/auth.guard';
export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent) },
	{
		path: '', loadComponent: () => import('./modules/layout/principal.component').then(m => m.PrincipalComponent),
		canActivate: [authGuard, rolGuard],
		canLoad: [authGuard, rolGuard],
		children: [

			{
				path: 'persona',
				loadComponent: () => import('./modules/boletas/persona/persona.component').then(m => m.PersonaComponent)
				, canActivate: [authGuard, rolGuard], data: { roles: [1] }

			},
			{
				path: 'empresa',
				loadComponent: () => import('./modules/boletas/empresa/empresa.component').then(m => m.EmpresaComponent),
				canActivate: [authGuard, rolGuard],
				data: { roles: [1, 2] }
			},
			{

				path: 'parametros',
				loadComponent: () => import('./modules/boletas/empresa/actividades/actividades.component').then(a => a.ActividadesComponent),
				canActivate: [authGuard, rolGuard],
				data: { roles: [1] }
			},

			{
				path: 'boleta',
				loadComponent: () => import('./modules/boletas/boleta/boleta.component').then(m => m.BoletaComponent),
				canActivate: [authGuard, rolGuard],

				data: { roles: [1, 2] }
			},
			{
				path: 'proyecto',
				loadComponent: () => import('./modules/boletas/proyecto/proyecto.component').then(m => m.ProyectoComponent),
				canActivate: [authGuard, rolGuard],

				data: { roles: [1, 2] }
			},
			{
				path: 'perfil',
				loadComponent: () => import('./modules/login/perfile/perfile.component').then(m => m.PerfileComponent),
				canActivate: [authGuard]
			},
			{
				path: 'dashboard',
				loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
				canActivate: [authGuard]

			},
			{
				path: 'sin-acceso',
				loadComponent: () => import('./modules/login/sin-acceso/sin-acceso.component').then(m => m.SinAccesoComponent)
				, canActivate: [authGuard],
				
			},
			
			{
			  path: 'dashboard',
			  loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
			},
			
		]
	},
	{ path: '**', redirectTo: 'dashboard' },
];

