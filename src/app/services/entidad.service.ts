import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { EntidadFinanciera } from '../models/boleta.model';


@Injectable({ providedIn: 'root' })
export class EntidadService {
  private apiUrl = `${environment.apiUrl}/entidades/`;

  constructor(private http: HttpClient) {}

  getEntidades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

	getEntidadesFinancieras(): Observable<EntidadFinanciera[]> {
		return this.http.get<EntidadFinanciera[]>(`${this.apiUrl}entidad-financiera/`);
	}
	getDashboardData(): Observable<any> {
		return this.http.get(`${this.apiUrl}dashboard/`); 
	}
}
