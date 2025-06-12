import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { EntidadFinanciera } from '../models/boleta.model';


@Injectable({
  providedIn: 'root'
})


export class EntidadFinancieraService {

  private apiUrl = `${environment.apiUrl}/entidad-financiera/`;

  constructor(private http: HttpClient) { }

  getEntidadesFinancieras(): Observable<EntidadFinanciera[]> {
    return this.http.get<EntidadFinanciera[]>(this.apiUrl);
  }
  postEntidadFinanciera(data: EntidadFinanciera): Observable<EntidadFinanciera[]> {
    return this.http.post<EntidadFinanciera[]>(`${this.apiUrl}`, data);
  }
  eliminarEntidadFinanciera(id: number): Observable<EntidadFinanciera[]> {
    return this.http.delete<EntidadFinanciera[]>(`${this.apiUrl}${id}/`);
  }
  putEntidadFinanciera(id: number, EntidadFinanciera: EntidadFinanciera): Observable<EntidadFinanciera[]> {
    return this.http.put<EntidadFinanciera[]>(`${this.apiUrl}${id}/`, EntidadFinanciera);
  }
}