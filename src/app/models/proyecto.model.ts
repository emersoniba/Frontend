import { Boleta } from "./boleta.model";

export interface Entidad {
	id: number,
	denominacion: string,
	nit: string,
	representante_legal: string,
	contacto: string,
	correo: string,
	fecha_eliminacion: string ; 
}

export interface Departamento {
	id: number,
	nombre: string,
}

export interface Proyecto {
	id: number,
	nombre: string,
	descripcion: string,
	entidad: Entidad,
	entidadId: number;
	departamento: Departamento,
	fecha_creado: string,
	fecha_finalizacion: string,
	fecha_eliminacion: string,
	boletas: Boleta[],

}
