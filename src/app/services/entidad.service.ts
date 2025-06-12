import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })
export class EntidadService {
  private apiUrl = `${environment.apiUrl}/entidades/`;

  constructor(private http: HttpClient) {}

  getEntidades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
