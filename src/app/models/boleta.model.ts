export interface Estado {
  id: number,
  nombre: string,
  descripcion: string,
  color: string,
  icono: string,
}

export interface EntidadFinanciera {
  id: number,
  nombre: string,
}

export interface Proyecto {
  id: number,
  nombre: string,
  descripcion: string,
}
export interface Tipo{
  id: number,
  nombre: string,
}
export interface Boleta {
  id?: number,
  numero?: string,
  concepto?: string,
  entidad_financiera: EntidadFinanciera | null,
  fecha_inicio: string,
  fecha_finalizacion: string,
  monto?: number,
  cite: string | null,
  estado: Estado,
  proyecto: Proyecto,
  proyecto_id: Proyecto,
  tipo_boleta: Tipo,
  tipo_boleta_id: number,
  observaciones: string | null,
  nota_ejecucion: string | null,
  creado_por?: number,
  actualizado_por?: number,
  fecha_creado?: string,
  fecha_actualizado?: string,
  archivo_adjunto?: string,
  archivo_adjunto_url?: string,
}