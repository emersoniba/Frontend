import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
//import { environment } from '../../../environments/environment';

export interface EntidadFinanciera {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class EntidadFinancieraService {
  private apiUrl = `${environment.apiUrl}/entidad_financiera/`;

  constructor(private http: HttpClient) {}

  getEntidadesFinancieras(): Observable<EntidadFinanciera[]> {
    return this.http.get<EntidadFinanciera[]>(this.apiUrl);
  }
}