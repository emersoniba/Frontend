import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
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

  logout() {
    localStorage.removeItem('tkn-boletas');
    localStorage.removeItem('tkn-refresh');
  }
}
