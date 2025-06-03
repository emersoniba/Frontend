import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Persona, Rol } from '../models/auth.interface';
import { Observable } from 'rxjs';

interface ChangePasswordPayload {
  password_actual: string;
  nuevo_password: string;
  confirmacion_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  registrar(result: any) {
    throw new Error('Method not implemented.');
  }

  private url: string = environment.apiUrl;
  constructor(
    private http: HttpClient
  ) { }

  getPersonasUsuario(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.url}/personas/con_usuario/`)
  }
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.url}/roles/`)
  }

  getPersonaProfile(): Observable<Persona> {
    return this.http.get<Persona>(`${this.url}/personas/profile_user/`)
  }

  deletePersona(ci: number): Observable<any> {
    return this.http.delete(`${this.url}/personas/${ci}/`)
  }
  deleteUsuario(ci: number): Observable<any> {
    return this.http.delete(`${this.url}/personas/eliminar_usuario/${ci}/`)
  }

  putPersona(ci: number, persona: any): Observable<any> {
    return this.http.put(`${this.url}/personas/${ci}/`, persona);
  }
  putPersonal(ci: number, persona: any): Observable<any> {
    return this.http.put(`${this.url}/personas/${ci}/editar_persona`, persona);
  }
  postPersona(data: Persona): Observable<any> {
    return this.http.post(`${this.url}/personas/`, data);
  }


  postChangePassword(ci: number, data: any): Observable<any> {
    return this.http.post(`${this.url}/personas/${ci}/change_password/`, data);
  }


  postCrearUsuarioPersona(ci: number, data: { roles: number[] }): Observable<any> {
    return this.http.post(`${this.url}/personas/${ci}/crear_usuario/`, data);
  }

  postEditarRolPersona(ci: number, data: { roles: number[] }): Observable<any> {
    return this.http.post(`${this.url}/personas/${ci}/editar_rol/`, data);
  }

  putreactivarPersona(ci: number, body: any): Observable<any> {
    return this.http.put(`${this.url}/personas/${ci}/confirmar_habilitacion/`, body);
  }

  getRolesPorPersona(personaId: number): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.url}/personas/${personaId}/roles/`);
  }


  getPerfil(): Observable<{ persona: Persona, usuario: any, roles: Rol[] }> {
    return this.http.get<{ persona: Persona, usuario: any, roles: Rol[] }>(`${this.url}/personas/perfil/`);
  }

  subirImagen(ci: string, imagenBase64: string) {
    const body = { imagen_base64: imagenBase64 };
    return this.http.post(`${this.url}/personas/${ci}/subir_imagen/`, body);
  }

}



