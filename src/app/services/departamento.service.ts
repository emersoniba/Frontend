import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
@Injectable({ providedIn: 'root' })
export class DepartamentoService {

 private apiUrl = `${environment.apiUrl}/departamentos/`;
  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
