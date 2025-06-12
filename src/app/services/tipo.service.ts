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
  deleteTipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
  getTipoById(id: number): Observable<Tipo> {
    return this.http.get<Tipo>(`${this.apiUrl}/${id}`);
  }

  postTipo(data: Tipo): Observable<Tipo[]> {
    return this.http.post<Tipo[]>(`${this.apiUrl}`, data);
  }

  putTipo(id: number, Tipo: Tipo): Observable<Tipo[]> {
    return this.http.put<Tipo[]>(`${this.apiUrl}${id}/`, Tipo);
  }

}