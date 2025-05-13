export interface Entidad {
  id: number;
  denominacion: string;
  nit: string;
  representante_legal: string;
  contacto: string;
  correo: string;
}

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  entidad: Entidad;
  departamento: Departamento;
  fecha_creado: string;
  fecha_finalizacion: string;
}
