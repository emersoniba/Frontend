import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Login, LoginResponse } from '../models/auth.interface';
import { Usuario } from '../models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public login(data: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/token/`, data);
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

  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/personas/profile_user/`);
  }

  logout(): void {
    localStorage.removeItem('tkn-boletas');
    localStorage.removeItem('tkn-refresh');
  }
}
