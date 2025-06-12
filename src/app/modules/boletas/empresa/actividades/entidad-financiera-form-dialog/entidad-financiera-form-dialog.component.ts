

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MaterialModule } from '../../../../../shared/app.material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { ErrorHandlerService } from '../../../../../services/error-handler.service';
import { DepartamentoService } from '../../../../../services/departamento.service';
import { Departamento } from '../../../../../models/empresa.interface';

import { EntidadFinanciera } from '../../../../../models/boleta.model';
import { EntidadFinancieraService } from '../../../../../services/entidad-financiera.service';


@Component({
  selector: 'app-entidad-financiera-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './entidad-financiera-form-dialog.component.html',
  styleUrl: './entidad-financiera-form-dialog.component.css'
})
export class EntidadFinancieraFormDialogComponent {


  esEdicion: boolean = false;
  formEntidadFinanciera!: FormGroup;

  constructor(

    private readonly entidadFinancieraService: EntidadFinancieraService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EntidadFinancieraFormDialogComponent>,
    private errorHandler: ErrorHandlerService,

    @Inject(MAT_DIALOG_DATA) public data: { entidadFinanciera?: EntidadFinanciera }
  ) {

    this.getFormBuilder();
    if (data.entidadFinanciera) {
      this.esEdicion = true;
      this.formEntidadFinanciera.patchValue({
        id: data.entidadFinanciera.id,
        nombre: data.entidadFinanciera.nombre,
      });
    }
  }

  ngOnInit(): void {
    
  }

  public getFormBuilder(): void {
    this.formEntidadFinanciera = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  public cancelar(): void {
    this.dialogRef.close();
  }

  public registrarEntidadFinanciera(): void {
    if (this.formEntidadFinanciera.invalid) {
      this.formEntidadFinanciera.markAllAsTouched();
      return;
    }

    const entidadfinancieraData = this.formEntidadFinanciera.value;
    const save$ = this.esEdicion
      ? this.entidadFinancieraService.putEntidadFinanciera(entidadfinancieraData.id!, entidadfinancieraData)
      : this.entidadFinancieraService.postEntidadFinanciera(entidadfinancieraData);

    save$.subscribe({
      next: (res) => {
        this.dialogRef.close(res);
        Swal.fire(
          this.esEdicion ? '¡Actualizada!' : '¡Registrada!',
          this.esEdicion
            ? 'Entidad Financiera actualizada correctamnete.'
            : 'Entidad Financiera añadida correctamente.', 'success'
        );

      },
      error: (error) => {
        if (error.status === 400 && error.error) {
          Swal.fire(
            'Error de validación',
            'Por favor revisa los campos, es posible que ya este registrada la entidad Financiera', 'error');
        } else {
          this.errorHandler.handleError(error, 'Ocurrió un error al registrar la Entidad Financiera');
        }
      }
    });
  }


}