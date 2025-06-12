export interface Rol {
	id: number,
	nombre: string,
}

export interface Usuario {
	nombres: string,
	apellido_paterno: string,
	apellido_materno: string,
	cargo: string,
	unidad: string,
	id?: number,
	username?: string,
	roles?: Rol[],
}


export interface ChangePasswordPayload {
	password_actual: string,
	nuevo_password: string,
	confirmacion_password: string,
}

export interface Login {
	username: string,
	password: string
}

export interface LoginResponse {
	access: string,
	refresh: string,
	roles: string[],
	usuario_id: number,
	persona_ci?: string,
	nombre_completo: string,
	roles_id: number[],

}

export interface Departamento {
	id: number,
	nombre: string,
	nombre_reducido: string,
}

export interface Persona {
	ci: string,
	expedido?: Departamento,
	departamento?: Departamento,
	nombres: string,
	apellido_paterno: string,
	apellido_materno: string,
	cargo: string,
	unidad: string,
	telefono?: string,
	direccion?: string,
	imagen?: string,
	correo: string,
	usuario?: Usuario,
	roles?: Rol[],
}
