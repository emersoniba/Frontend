import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: 'login', loadComponent: () => import ('./modules/login/login.component').then(m => m.LoginComponent)},
    {path: 'principal', loadComponent: () => import ('./modules/layout/principal/principal.component').then(m => m.PrincipalComponent)}
];
