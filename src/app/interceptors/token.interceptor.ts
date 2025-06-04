
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {

	const token = localStorage.getItem('tkn-boletas');
	if (req.url.includes('/login/')) {
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
