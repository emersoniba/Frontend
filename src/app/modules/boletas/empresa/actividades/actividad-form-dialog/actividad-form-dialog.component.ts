
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MaterialModule } from '../../../../../shared/app.material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

import { Actividad } from '../../../../../models/empresa.interface';
import Swal from 'sweetalert2';
import { ActividadService } from '../../../../../services/actividad.service';
import { ErrorHandlerService } from '../../../../../services/error-handler.service';

@Component({
  selector: 'app-actividad-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './actividad-form-dialog.component.html',
  styleUrl: './actividad-form-dialog.component.css'
})

export class ActividadFormDialogComponent {

  esEdicion: boolean = false;
  formActividad!: FormGroup;

  constructor(

    private readonly actividadService: ActividadService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ActividadFormDialogComponent>,
    private errorHandler: ErrorHandlerService,

    @Inject(MAT_DIALOG_DATA) public data: { actividad?: Actividad }
  ) {

    this.getFormBuilder();
    if (data.actividad) {
      this.esEdicion = true;
      this.formActividad.patchValue({
        id: data.actividad.id,
        descripcion: data.actividad.descripcion
      });
    }
  }


  ngOnInit(): void {
    
  }

  public getFormBuilder(): void {
    this.formActividad = this.fb.group({
      id: [''],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  public cancelar(): void {
    this.dialogRef.close();
  }

  public registrar(): void {
    if (this.formActividad.invalid) {
      this.formActividad.markAllAsTouched();
      return;
    }

    const actividadData = this.formActividad.value;
    const save$ = this.esEdicion
      ? this.actividadService.putActividad(actividadData.id!, actividadData)
      : this.actividadService.postActividad(actividadData);

    save$.subscribe({
      next: (res) => {
        this.dialogRef.close(res);
        Swal.fire(
          this.esEdicion ? '¡Actualizada!' : '¡Registrada!',
          this.esEdicion
            ? 'Actividad actualizada correctamnete.'
            : 'Actividad añadida correctamente.', 'success'
        );

      },
      error: (error) => {
        if (error.status === 400 && error.error) {
          Swal.fire(
            'Error de validación',
            'Por favor revisa los campos, es posible que ya este registrada la Actividad', 'error');
        } else {
          this.errorHandler.handleError(error, 'Ocurrió un error al registrar la actividad');
        }
      }
    });
  }


}