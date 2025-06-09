import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Persona, Rol, ChangePasswordPayload } from '../models/auth.interface';
import { Observable } from 'rxjs';
import { ResponseData } from '../models/response.model';

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

	getPersonasUsuario(): Observable<ResponseData> {
		return this.http.get<ResponseData>(`${this.url}/personas/con_usuario/`)
	}	
	
	getPerfil(): Observable<ResponseData> {
		return this.http.get<ResponseData>(`${this.url}/personas/perfil/`);
	}

	getRoles(): Observable<Rol[]> {
		return this.http.get<Rol[]>(`${this.url}/roles/`)
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

	postEditarRolPersona(ci: string, data: { roles: number[] }): Observable<any> {
		return this.http.post(`${this.url}/personas/${ci}/editar_rol/`, data);
	}

	putreactivarPersona(ci: number, body: any): Observable<any> {
		return this.http.put(`${this.url}/personas/${ci}/confirmar_habilitacion/`, body);
	}

	getRolesPorPersona(personaId: number): Observable<Rol[]> {
		return this.http.get<Rol[]>(`${this.url}/personas/${personaId}/roles/`);
	}

	subirImagen(ci: string, imagenBase64: string) {
		const body = { imagen_base64: imagenBase64 };
		return this.http.post(`${this.url}/personas/${ci}/subir_imagen/`, body);
	}

}