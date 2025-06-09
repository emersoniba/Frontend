import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RolesService } from '../services/roles.service';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {

  constructor(
    private router: Router,
    private rolesService: RolesService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean {
    const rolesPermitidos = route.data['roles'] as number[];
    console.log('Roles permitidos:', rolesPermitidos);
    const tieneAcceso = this.rolesService.hasAnyRole(rolesPermitidos);
    if (!tieneAcceso) {
      this.router.navigate(['/sin-acceso']);
    }
    return tieneAcceso;
  }
}