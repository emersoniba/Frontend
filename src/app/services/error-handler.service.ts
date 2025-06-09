import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  public handleError(error: any, mensaje: string = 'Ocurrió un error inesperado'): void {
    const msg = this.getErrorMessage(error) || mensaje;
    Swal.fire('Error', msg, 'error');
  }

  public handleSuccess(mensaje: string, titulo: string = '¡Éxitp!'): void {
    Swal.fire(titulo, mensaje, 'success');
  }

  public getErrorMessage(error: any): string | null {
    if (!error) return null;

    if (typeof error === 'string') {
      return error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (Array.isArray(error)) {
      return error.join('\n');
    }

    if (error.error && typeof error.error === 'object') {
      const mensajes: string[] = [];

      for (const key in error.error) {
        if (Array.isArray(error.error[key])) {
          mensajes.push(...error.error[key]);
        } else {
          mensajes.push(error.error[key]);
        }
      }
      return mensajes.join('\n');
    }
    return null;
  }
}