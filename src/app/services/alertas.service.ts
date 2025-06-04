import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
	providedIn: 'root'
})
export class AlertasService {
	private apiUrl = `${environment.apiUrl}/envio-alertas/`;

	constructor(private http: HttpClient) { }

	getHistorialAlertas(filters: any = {}): Observable<any> {
		let params = new HttpParams();
		for (const key in filters) {
			if (filters[key]) {
				params = params.append(key, filters[key]);
			}
		}
		return this.http.get(this.apiUrl, { params });
	}
}
