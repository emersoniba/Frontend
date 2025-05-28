import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { EmpresaService } from '../../../../services/empresa.service';
import { MatIconModule } from '@angular/material/icon';
import { Actividad, Empresa } from '../../../../models/empresa.interface';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-empresa-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    MatButtonModule, MatSelectModule, MatIconModule],
  templateUrl: './empresa-form-dialog.component.html',
})

export class EmpresaFormDialogComponent {
  formEmpresa!: FormGroup;
  esEdicion: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmpresaFormDialogComponent>,
    private empresaService: EmpresaService,
    @Inject(MAT_DIALOG_DATA) public data: { actividades: Actividad[], empresa?: Empresa }
  ) {

    this.getFormBuilder();
    if (data.empresa) {
      this.esEdicion = true;
      this.formEmpresa.patchValue({
        id: data.empresa.id,
        denominacion: data.empresa.denominacion,
        nit: data.empresa.nit,
        actividad_id: data.empresa.actividad?.id,
        contacto: data.empresa.contacto,
        correo: data.empresa.correo,
        representante_legal: data.empresa.representante_legal
      });
    }
  }

  public getFormBuilder(): void {
    this.formEmpresa = this.fb.group({
      id: [''],
      denominacion: ['', [Validators.required, Validators.minLength(5)]],
      nit: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      actividad_id: ['', [Validators.required]],
      contacto: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      representante_legal: ['', [Validators.required, Validators.minLength(5)]]
    });
  }



  cancelar(): void {
    this.dialogRef.close();
  }


  registrar(): void {
   /* if (this.formEmpresa.valid) {
      this.dialogRef.close(this.formEmpresa.value);
    }*/
    if (this.formEmpresa.invalid) {
      this.formEmpresa.markAllAsTouched();
      return;
    }

    const empresaData = this.formEmpresa.value;
    const save$ = this.esEdicion
      ? this.empresaService.putEmpresa(empresaData.id!, empresaData)
      : this.empresaService.postEmpresa(empresaData);

    save$.subscribe({
      next: (res) => {
        this.dialogRef.close(res); 
        Swal.fire(
          this.esEdicion ?'¡Actualizada!':'¡Registrada!',
          this.esEdicion
            ? 'Empresa actualizada correctamnete.'
            : 'Empresa añadida correctamente.', 'success'
        );
        
      },
      error: (error) => {
        if (error.status === 400 && error.error) {
          if (error.error.nit) {
            this.formEmpresa.get('nit')?.setErrors({ backend: error.error.nit[0] });
          }
          if (error.error.correo) {
            this.formEmpresa.get('correo')?.setErrors({ backend: error.error.correo[0] });
          }
          Swal.fire(
          'Error de validación',
          'Por favor revisa los campos: NIT o Correo ya están registrados en otra entidad.',
          'error'
        );
        } else {
          console.error('Error al registrar empresa', error);
        }
      }
    });
  }


}