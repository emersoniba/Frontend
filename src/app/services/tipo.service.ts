import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Tipo } from '../models/boleta.model';

@Injectable({
  providedIn: 'root'
})
export class TipoService {
  private apiUrl = `${environment.apiUrl}/tipos-boleta/`;

  constructor(private http: HttpClient) {}

  getTipos(): Observable<Tipo[]> {
    return this.http.get<Tipo[]>(this.apiUrl);
  }
  getTipoById(id: number): Observable<Tipo> {
    return this.http.get<Tipo>(`${this.apiUrl}/${id}`);
  }

  createTipo(estado: Omit<Tipo, 'id'>): Observable<Tipo> {
    return this.http.post<Tipo>(this.apiUrl, estado);
  }

  updateTipo(id: number, estado: Partial<Tipo>): Observable<Tipo> {
    return this.http.put<Tipo>(`${this.apiUrl}/${id}`, estado);
  }

  deleteEstado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}