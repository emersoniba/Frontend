import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const token = localStorage.getItem('tkn-boletas');
  const authService = inject(AuthService);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh/')) {
        const refresh = localStorage.getItem('tkn-refresh');
        dialog.closeAll();
        if (refresh) {
          return authService.refreshToken().pipe(
            switchMap((res: any) => {
              localStorage.setItem('tkn-boletas', res.access);
              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.access}` }
              });
              return next(newReq);
            }),
            catchError(() => {
              localStorage.clear();
              router.navigate(['/login']);
              Swal.fire('Sesión expirada', 'Por favor vuelve a iniciar sesión.', 'info');
              return throwError(() => error);
            })
          );
        } else {
          localStorage.clear();
          router.navigate(['/login']);
          Swal.fire('Sesión expirada', 'Por favor vuelve a iniciar sesión.', 'info');
        }
      }
      return throwError(() => error);
    })
  );
};