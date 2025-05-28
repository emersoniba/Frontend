import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const rolesPermitidos = route.data['roles'] as number[];
    const rolesUsuario = JSON.parse(localStorage.getItem('roles_id') || '[]');

    const tieneAcceso = rolesUsuario.some((rol: number) => rolesPermitidos.includes(rol));
    if (!tieneAcceso) {
      this.router.navigate(['/sin-acceso']); // redirig
    }
    return tieneAcceso;
  }
}
