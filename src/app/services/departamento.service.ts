import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  private apiUrl = 'http://127.0.0.1:8000/api/departamentos/';

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
