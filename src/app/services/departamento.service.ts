import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Departamento } from '../models/empresa.interface';


@Injectable({ providedIn: 'root' })

export class DepartamentoService {

  private url = `${environment.apiUrl}/departamentos/`;
  constructor(private http: HttpClient) { }

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }
  eliminarDepartamento(id: number): Observable<any> {
    return this.http.delete(`${this.url}${id}/`);
  }
  postDepartamento(data: Departamento): Observable<Departamento[]> {
    return this.http.post<Departamento[]>(`${this.url}`, data);
  }

  putDepartamento(id: number, Departamento: Departamento): Observable<Departamento[]> {
    return this.http.put<Departamento[]>(`${this.url}${id}/`, Departamento);
  }
}
