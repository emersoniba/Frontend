import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export interface Proyecto {
  id?: number;
  nombre: string;
  descripcion: string;
  entidad: { id: number, denominacion: string } | number;
  departamento_id?: number;
  fecha_creado: string;
  fecha_finalizacion: string;
  creado_por_id?: number;
}


@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private apiUrl = 'http://127.0.0.1:8000/api/proyectos/';

  constructor(private http: HttpClient) {}

  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.apiUrl);
  }

  addProyecto(proyecto: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.apiUrl, proyecto);
  }

  updateProyecto(id: number, proyecto: Proyecto): Observable<Proyecto> {
  return this.http.put<Proyecto>(`${this.apiUrl}${id}/`, proyecto);
}
  deleteProyecto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      catchError(error => {
        console.error('Error en servicio al eliminar:', error);
        return throwError(() => error);
      })
    );
  }

}

