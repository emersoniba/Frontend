import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../shared/app.material';

import Swal from 'sweetalert2';
import { ErrorHandlerService } from '../../../../../services/error-handler.service';

import { Tipo } from '../../../../../models/boleta.model';
import { TipoService } from '../../../../../services/tipo.service';


@Component({
  selector: 'app-tipo-boleta-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './tipo-boleta-form-dialog.component.html',
  styleUrl: './tipo-boleta-form-dialog.component.css'
})
export class TipoBoletaFormDialogComponent {

  esEdicion: boolean = false;
  formTipo!: FormGroup;

  constructor(

    private readonly tipoService: TipoService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TipoBoletaFormDialogComponent>,
    private errorHandler: ErrorHandlerService,

    @Inject(MAT_DIALOG_DATA) public data: { tipo?: Tipo }
  ) {

    this.getFormBuilder();
    if (data.tipo) {
      this.esEdicion = true;
      this.formTipo.patchValue({
        id: data.tipo.id,
        nombre: data.tipo.nombre,
      });
    }
  }


  ngOnInit(): void {

  }

  public getFormBuilder(): void {
    this.formTipo = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  public cancelar(): void {
    this.dialogRef.close();
  }

  public registrarTipo(): void {
    if (this.formTipo.invalid) {
      this.formTipo.markAllAsTouched();
      return;
    }

    const tipoData = this.formTipo.value;
    const save$ = this.esEdicion
      ? this.tipoService.putTipo(tipoData.id!, tipoData)
      : this.tipoService.postTipo(tipoData);

    save$.subscribe({
      next: (res) => {
        this.dialogRef.close(res);
        Swal.fire(
          this.esEdicion ? '¡Actualizada!' : '¡Registrada!',
          this.esEdicion
            ? 'Tipo de boleta actualizado correctamnete.'
            : 'Tipo de boleta añadido correctamente.', 'success'
        );

      },
      error: (error) => {
        if (error.status === 400 && error.error) {
          Swal.fire(
            'Error de validación',
            'Por favor revisa los campos', 'error');
        } else {
          this.errorHandler.handleError(error, 'Ocurrió un error al registrar el tipo de boleta');
        }
      }
    });
  }


}