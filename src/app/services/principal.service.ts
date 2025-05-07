/*import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrincipalService {

  constructor() { }
}*/
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Principal, PrincipalResponse } from '../models/layout/principal.interface';

//**import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrincipalService {

  private url:string = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) {}
  /*public login (data:Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url, data);
  }*/
}


