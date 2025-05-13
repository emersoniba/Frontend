import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
//import { environment } from '../../../environments/environment';

export interface Estado {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private apiUrl = `${environment.apiUrl}/estados/`;

  constructor(private http: HttpClient) {}

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.apiUrl);
  }
}