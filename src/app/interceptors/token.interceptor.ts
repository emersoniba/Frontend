
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {

  const authService = inject(AuthService);//nhn
  const token = localStorage.getItem('tkn-boletas');

  if (req.url.includes('/login/')|| req.url.includes('/login/reset-password/')|| req.url.includes('/olvidaste-contrasenia/')) {
    return next(req);
  }
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  return next(req);


  

};