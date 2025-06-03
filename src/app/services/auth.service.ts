import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Login, LoginResponse, Persona } from '../models/auth.interface';
import { Usuario } from '../models/auth.interface';
import { Router } from '@angular/router';
import { RolesService } from './roles.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private rolesService: RolesService
  ) { }

  refreshToken() {
    const refresh = localStorage.getItem('tkn-refresh');
    return this.http.post(`${this.url}/refresh/`, { refresh });
  }
  logout() {
    localStorage.clear();
    this.rolesService.clearAll();
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
  /*esto solo es para el footer*/
  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/personas/profile_user/`);
  }

  getPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/personas/perfil/`);
  }
  hasRole(rol: string): boolean {
    return this.rolesService.hasRole(rol);
  }

  getCurrentUser(): Observable<Usuario> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.getToken()}`,
  });
  return this.http.get<Usuario>(`${this.url}/personas/yo/`, { headers });
}

  initSessionFromToken() {
    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.rolesService.setRoles(decoded.roles || []);
        this.rolesService.setRolesId(decoded.roles_id || []);
        this.rolesService.setFullName(decoded.nombre_completo || '');
      } catch (err) {
        console.error('Error decodificando token', err);
      }
    }
  }

}



