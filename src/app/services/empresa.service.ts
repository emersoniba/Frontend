import { Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environment/environment';
import { ResponseData } from '../models/response.model';
import { Empresa } from '../models/empresa.model';
import { Entidad } from '../models/proyecto.model';


@Injectable({
  providedIn: 'root'
})

export class EmpresaService {

  registrar(result: any) {
    throw new Error('Method not implemented.');
  }

  private url: string = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.url}/entidades/`);
  }

  getEmpresasConProyectos(entidad_id: number): Observable<ResponseData> {
    return this.http.get<ResponseData>(`${this.url}/entidades/proyectos-por-empresa/?entidad_id=${entidad_id}`);
  }

  getEmpresasConProyectosAll(): Observable<ResponseData> {
    return this.http.get<ResponseData>(`${this.url}/entidades/con_proyectos/`);

  }
  
  eliminarEmpresa(id: number): Observable<any> {
    return this.http.delete(`${this.url}/entidades/${id}/`);
  }

  getEmpresasPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.url}/entidades/${id}/`);
  }

  postEmpresa(data: Empresa): Observable<any> {
    return this.http.post(`${this.url}/entidades/`, data);
  }

  putEmpresa(id: number, empresa: any): Observable<any> {
    return this.http.put(`${this.url}/entidades/${id}/`, empresa);
  }

  buscarEmpresaPorNIT(nit: string) {
    return this.http.get<Empresa>(`${this.url}/entidades/buscar_por_nit/?nit=${nit}`);
  }

  verificarCorreo(correo: string, id?: number) {
    const params = new HttpParams().set('correo', correo).set('id', id || '');
    return this.http.get('/api/verificar-correo/', { params });
  }
}
