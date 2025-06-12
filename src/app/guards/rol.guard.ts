import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import {  of } from 'rxjs';

export const rolGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  let rolesPermitidos = route.data['roles'] as number[] | undefined;
  if (!rolesPermitidos && route.firstChild) {
    rolesPermitidos = route.firstChild.data['roles'] as number[] | undefined;
  }
  return authService.getCurrentUser().pipe(
    map(response => {
      const user = response.data;
      if (rolesPermitidos && rolesPermitidos.length > 0 &&
        Array.isArray(user.roles)) {
        const tieneAcceso = user.roles.some((rol: number) => rolesPermitidos.includes(rol));
        if (tieneAcceso) {
          return router.createUrlTree(['/sin-acceso']);
        }
      }
      return true;
    }),
    catchError(error => {
      console.error('Error al obtener el usuario', error);
      return of(router.createUrlTree(['/login']));
    })
  );

};
