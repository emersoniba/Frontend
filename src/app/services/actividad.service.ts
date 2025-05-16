import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad } from '../models/empresa.interface';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private url = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getActividades(): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.url}/actividad/`);
  }/*
  putActividades(): Observable<Actividad[]> {
    return this.http.put<Actividad[]>(`${this.url}/actividad/`);
  }*/
 
}
