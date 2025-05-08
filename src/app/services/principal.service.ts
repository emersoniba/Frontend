import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrincipalService {

  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDatosUsuario(): Observable<any> {
    return this.http.get<any>(`${this.url}/usuario-logeado/`);
  }
}