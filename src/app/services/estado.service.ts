import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { EntidadFinanciera, Estado } from '../models/boleta.model';


@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private apiUrl = `${environment.apiUrl}/estados/`;

  constructor(private http: HttpClient) { }

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.apiUrl);
  }

  getEstadoById(id: number): Observable<Estado> {
    return this.http.get<Estado>(`${this.apiUrl}/${id}`);
  }

  createEstado(estado: Omit<Estado, 'id'>): Observable<Estado> {
    return this.http.post<Estado>(this.apiUrl, estado);
  }

  updateEstado(id: number, estado: Partial<Estado>): Observable<Estado> {
    return this.http.put<Estado>(`${this.apiUrl}/${id}`, estado);
  }

  deleteEstado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getEntidadesFinancieras(): Observable<EntidadFinanciera[]> {
    return this.http.get<EntidadFinanciera[]>(`${this.apiUrl}entidad-financiera/`);
  }


}