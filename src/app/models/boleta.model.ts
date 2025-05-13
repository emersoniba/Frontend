export interface Estado {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
}

export interface EntidadFinanciera {
  id: number;
  nombre: string;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  // otros campos del proyecto si los necesitas
}

export interface Boleta {
  id: number;
  tipo: string;
  numero: string;
  concepto: string;
  entidad_financiera: EntidadFinanciera | null;
  fecha_inicio: string;
  fecha_finalizacion: string;
  monto: number;
  cite: string | null;
  estado: Estado;
  proyecto: Proyecto;
  observaciones: string | null;
  nota_ejecucion: string | null;
  creado_por?: number;
  actualizado_por?: number;
  fecha_creado?: string;
  fecha_actualizado?: string;
}