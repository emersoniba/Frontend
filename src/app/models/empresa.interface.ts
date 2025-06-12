
export interface Departamento {
  id: number;
  nombre: string;
}

export interface Actividad  {
  id?: number;
  descripcion: string;
}

export interface Empresa {
  id?: number;
  denominacion: string;
  actividad?: Actividad;
  nit: string;
  representante_legal: string;
  contacto: string;
  correo: string;
  proyectos: Proyecto[];
}


export interface nuevaEmpresa {
  denominacion: string;
  nit: string;
  representante_legal: string;
  correo: string;
  contacto: string;
};

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  entidad: Empresa;
  departamento: Departamento;
  fecha_creado: string;
  fecha_finalizacion: string;
}