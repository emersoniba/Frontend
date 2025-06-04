import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Proyecto } from '../models/proyecto.model';
import { ResponseData } from '../models/response.model';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';


@Injectable({
	providedIn: 'root'
})
export class ProyectoService {
	private apiUrl = `${environment.apiUrl}/proyectos/`;


	constructor(private http: HttpClient) { }

	getProyectos(): Observable<Proyecto[]> {
		return this.http.get<Proyecto[]>(this.apiUrl);
	}

	addProyecto(proyecto: Proyecto): Observable<ResponseData> {
		return this.http.post<ResponseData>(this.apiUrl, proyecto);
	}

	updateProyecto(id: number, proyecto: Proyecto): Observable<ResponseData> {
		return this.http.put<ResponseData>(`${this.apiUrl}${id}/`, proyecto);
	}

	deleteProyecto(id: number): Observable<Proyecto> {
		return this.http.delete<Proyecto>(`${this.apiUrl}${id}/`);
	}

	getProyectosConBoletas(): Observable<ResponseData> {
		return this.http.get<ResponseData>(`${this.apiUrl}?includeBoletas=true`);
	}
}

