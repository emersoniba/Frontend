import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent) },
	{
		path: '', loadComponent: () => import('./modules/layout/principal.component').then(m => m.PrincipalComponent),
		canActivate: [AuthGuard],
		canLoad: [AuthGuard],
		children: [

			{
				path: 'persona', canActivate: [AuthGuard, RolesGuard], data: { roles: [1] },
				loadComponent: () => import('./modules/boletas/persona/persona.component').then(m => m.PersonaComponent)
			},
			{
				path: 'empresa',
				loadComponent: () => import('./modules/boletas/empresa/empresa.component').then(m => m.EmpresaComponent),
				canActivate: [AuthGuard, RolesGuard],
				data: { roles: [1, 2] }
			},
			{
				path: 'boleta',
				loadComponent: () => import('./modules/boletas/boleta/boleta.component').then(m => m.BoletaComponent)
				, canActivate: [AuthGuard, RolesGuard],
				data: { roles: [1, 2] }//id
			},
			{
				path: 'proyecto',
				loadComponent: () => import('./modules/boletas/proyecto/proyecto.component').then(m => m.ProyectoComponent)
				, canActivate: [AuthGuard, RolesGuard],
				data: { roles: [1, 2] }
			},
			{
				path: 'perfil',
				loadComponent: () => import('./modules/login/perfile/perfile.component').then(m => m.PerfileComponent)
				, canActivate: [AuthGuard]

			},
			{
				path: 'sin-acceso',
				loadComponent: () => import('./modules/login/sin-acceso/sin-acceso.component').then(m => m.SinAccesoComponent)
				, canActivate: [AuthGuard, RolesGuard],
				data: { roles: [1] }
			},
			/*
			{
			  path: 'dashboard',
			  loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
			},
			*/
		]
	},
	{ path: '**', redirectTo: 'login' },
];

