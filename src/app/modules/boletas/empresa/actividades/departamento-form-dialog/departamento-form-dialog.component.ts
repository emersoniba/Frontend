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
@Component({
  selector: 'app-departamento-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './departamento-form-dialog.component.html',
  styleUrl: './departamento-form-dialog.component.css'
})
export class DepartamentoFormDialogComponent {

  esEdicion: boolean = false;
  formDepartamento!: FormGroup;

  constructor(

    private readonly departamentoService: DepartamentoService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DepartamentoFormDialogComponent>,
    private errorHandler: ErrorHandlerService,

    @Inject(MAT_DIALOG_DATA) public data: { departamento?: Departamento }
  ) {

    this.getFormBuilder();
    if (data.departamento) {
      this.esEdicion = true;
      this.formDepartamento.patchValue({
        id: data.departamento.id,
        nombre: data.departamento.nombre,
        nombre_reducido: data.departamento.nombre_reducido,
      });
    }
  }


  ngOnInit(): void {
    
  }

  public getFormBuilder(): void {
    this.formDepartamento = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(4)]],
      nombre_reducido: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  public cancelar(): void {
    this.dialogRef.close();
  }

  public registrar(): void {
    if (this.formDepartamento.invalid) {
      this.formDepartamento.markAllAsTouched();
      return;
    }

    const departamentoData = this.formDepartamento.value;
    const save$ = this.esEdicion
      ? this.departamentoService.putDepartamento(departamentoData.id!, departamentoData)
      : this.departamentoService.postDepartamento(departamentoData);

    save$.subscribe({
      next: (res) => {
        this.dialogRef.close(res);
        Swal.fire(
          this.esEdicion ? '¡Actualizada!' : '¡Registrada!',
          this.esEdicion
            ? 'Departamento actualizada correctamnete.'
            : 'Departamento añadida correctamente.', 'success'
        );

      },
      error: (error) => {
        if (error.status === 400 && error.error) {
          Swal.fire(
            'Error de validación',
            'Por favor revisa los campos, es posible que ya este registrada la departamento', 'error');
        } else {
          this.errorHandler.handleError(error, 'Ocurrió un error al registrar la departamento');
        }
      }
    });
  }


}