import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Boleta, Estado, EntidadFinanciera } from '../models/boleta.model';

@Injectable({
  providedIn: 'root'
})
export class BoletaService {
  private apiUrl = 'http://127.0.0.1:8000/api/boletas/'; // Ajusta tu URL

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
  // En boleta.service.ts
    getBoletasPorProyecto(proyectoId: number): Observable<Boleta[]> {
    const url = `boleta_proyecto/?proyecto_id=${proyectoId}`;
    return this.http.get<Boleta[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error cargando boletas: ', error);
        return throwError(() => new Error('Error al cargar boletas'));
      })
    );
  }


}
export class EstadoService {
  private apiUrl = 'http://127.0.0.1:8000/api/'; // Ajusta tu URL

  constructor(private http: HttpClient) { }


  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.apiUrl}estados/`);
  }

  getEntidadesFinancieras(): Observable<EntidadFinanciera[]> {
    return this.http.get<EntidadFinanciera[]>(`${this.apiUrl}entidad_financiera/`);
  }
}
export class EntidadService {
  private apiUrl = 'http://127.0.0.1:8000/api/'; 

  constructor(private http: HttpClient) { }

  getEntidadesFinancieras(): Observable<EntidadFinanciera[]> {
    return this.http.get<EntidadFinanciera[]>(`${this.apiUrl}entidad_financiera/`);
  }
}