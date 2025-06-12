import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface EntidadFinanciera {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class EntidadFinancieraService {
  private apiUrl = `${environment.apiUrl}/entidad-financiera/`;

  constructor(private http: HttpClient) {}

  getEntidadesFinancieras(): Observable<EntidadFinanciera[]> {
    return this.http.get<EntidadFinanciera[]>(this.apiUrl);
  }
}