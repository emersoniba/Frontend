import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RolesService } from '../services/roles.service';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {

  constructor(
    private router: Router,
    private rolesService: RolesService
  ) { }

 /* canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const rolesPermitidos = route.data['roles'] as number[];
    const rolesUsuario= this.rolesService.getRolesId();

    const tieneAcceso = rolesUsuario.some((rol: number) => rolesPermitidos.includes(rol));
    if (!tieneAcceso) {
      this.router.navigate(['/sin-acceso']);
    }
    return tieneAcceso;
  }
}*/
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const rolesPermitidos = route.data['roles'] as number[];
    const tieneAcceso = this.rolesService.hasAnyRole(rolesPermitidos);
    if (!tieneAcceso) {
      this.router.navigate(['/sin-acceso']);
    }
    return tieneAcceso;
  }
}
