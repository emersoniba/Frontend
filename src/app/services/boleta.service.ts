import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Boleta, Estado, EntidadFinanciera } from '../models/boleta.model';
import { environment } from '../../environment/environment';
import { ResponseData } from '../models/response.model';

@Injectable({
	providedIn: 'root'
})
export class BoletaService {

	private apiUrl = `${environment.apiUrl}/boletas/`;
	private apiUrlBoletas = `${environment.apiUrl}/boletas-por-proyecto/listado-boletas-por-proyecto/`;

	constructor(private http: HttpClient) { }

	getBoletas(): Observable<Boleta[]> {
		return this.http.get<Boleta[]>(this.apiUrl);
	}

	getBoleta(id: number): Observable<Boleta> {
		return this.http.get<Boleta>(`${this.apiUrl}${id}/`);
	}

	createBoleta(boleta: Boleta): Observable<Boleta> {
		return this.http.post<Boleta>(this.apiUrl, boleta);
	}

	updateBoleta(id: number, boleta: Boleta): Observable<Boleta> {
		return this.http.put<Boleta>(`${this.apiUrl}${id}/`, boleta);
	}

	deleteBoleta(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}${id}/`);
	}
	getBoletasPorProyecto(proyectoId: number): Observable<ResponseData> {
		return this.http.get<ResponseData>(`${this.apiUrlBoletas}?proyecto_id=${proyectoId}`);
	}

	verBoletaPDF(id: number) {
		return this.http.get(`${this.apiUrl}${id}/ver-pdf/`, { responseType: 'blob' });
	}

}
