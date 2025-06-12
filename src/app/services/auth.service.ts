import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Login, LoginResponse, Usuario } from '../models/auth.interface';
import { ResponseData } from '../models/response.model';
@Injectable({
	providedIn: 'root'
})
export class AuthService {

	private url: string = environment.apiUrl;

	constructor(
		private http: HttpClient,
		private router: Router,
	) { }

	refreshToken() {
		const refresh = localStorage.getItem('tkn-refresh');
		return this.http.post(`${this.url}/refresh/`, { refresh });
	}

	logout() {
		localStorage.clear();
		this.router.navigate(['/login']);
	}

	public login(data: Login): Observable<LoginResponse> {
		return this.http.post<LoginResponse>(`${this.url}/login/`, data);
	}

	getToken(): string | null {
		return localStorage.getItem('tkn-boletas');
	}

	getUser(): any {
		const token = this.getToken();
		if (token) {
			try {
				return jwtDecode(token);
			} catch (error) {
				console.error('Error decodificando el token', error);
				return null;
			}
		}
		return null;
	}

	getPerfil(): Observable<Usuario> {
		return this.http.get<Usuario>(`${this.url}/personas/perfil/`);
	}

	getCurrentUser(): Observable<ResponseData> {
		const headers = new HttpHeaders({
			'Authorization': `Bearer ${this.getToken()}`,
		});
		return this.http.get<ResponseData>(`${this.url}/personas/yo/`, { headers });
	}

	initSessionFromToken() {
		const token = this.getToken();
		if (token) {
			try {
				const decoded: any = jwtDecode(token);
			} catch (err) {
				console.error('Error decodificando token', err);
			}
		}
	}

}



