
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {

  const authService = inject(AuthService);//nhn
  const token = localStorage.getItem('tkn-boletas');
  if (req.url.includes('/login/')) {//login?
    //if (req.url.match(/\/(login|token)/)) {
    return next(req);
  }
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Authorization', cloned);
    return next(cloned);
  }

  console.warn('Petición sin token enc:', req.url);
  
  return next(req);


};