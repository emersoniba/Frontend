import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Empresa } from '../models/empresa.interface';
import { Observable } from 'rxjs';
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

  getEmpresasConProyectos(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.url}/entidades/con_proyectos`);
  }



  /*
 deleteEmpresa(empresa: any): Observable<any> {
   return this.http.delete(`${this.url}/entidades/`, empresa);
 }
 putreactivarEmpresa(id: number, body: any): Observable<any> {
   return this.http.put(`${this.url}/entidades/${id}/confirmar_habilitacion/`, body);
 }
*/
}
