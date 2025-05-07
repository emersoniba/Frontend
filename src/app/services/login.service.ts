import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Login, LoginResponse } from '../models/login.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private url:string = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) {}
  public login (data:Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url, data);
  }
}


