import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/auth.interface';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url:string = environment.apiUrl;

  constructor(private http: HttpClient) {}

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


  /**
   * Funcion para obtener datos del usuario
   * @returns 
   */
  getProfile(): Observable<Usuario>{
    const tkn = localStorage.getItem('tkn-boletas');
    const headers = new HttpHeaders({
      'Authorization':  `Bearer ${tkn}`
    });
    return this.http.get<Usuario>(`${this.url}/personas/profile_user/`,  {headers: headers});
  }

  logout(): void {
    localStorage.removeItem('tkn-boletas');
    localStorage.removeItem('tkn-refresh');
  }
}
