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
  esEdicion: boolean = false; // edicion adicon
  actividades: any[] = [];

 constructor(
  private fb: FormBuilder,
  private dialogRef: MatDialogRef<EmpresaFormDialogComponent>,
  private empresaService: EmpresaService,
  @Inject(MAT_DIALOG_DATA) public data: { actividades: any[], empresa?: any }
) {
  this.actividades = data.actividades;

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
  verificarCorreoAntesDeGuardar(): void {
    const correo = this.formEmpresa.get('correo')?.value;
    const id = this.formEmpresa.get('id')?.value;

    this.empresaService.verificarCorreo(correo, id).subscribe((res: any) => {
      if (res.existe) {
        Swal.fire({
          icon: 'warning',
          title: 'Correo duplicado',
          text: 'Ya existe este correo registrado.'
        });
      } else {
        this.registrar();  // Llama al método de guardado solo si no existe
      }
    });
  }

  registrar(): void {
    if (this.formEmpresa.valid) {
      const mensaje = this.esEdicion
        ? '¿Está seguro que desea actualizar esta empresa?'
        : '¿Está seguro que desea registrar esta empresa?';

      Swal.fire({
        title: 'Confirmación',
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.esEdicion ? 'Actualizar' : 'Registrar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.dialogRef.close(this.formEmpresa.value);
          Swal.fire({
            title: this.esEdicion ? 'Actualizado' : 'Registrado',
            text: this.esEdicion
              ? 'La empresa se actualizó correctamente.'
              : 'La empresa fue registrada exitosamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Formulario inválido',
        text: 'Por favor, complete todos los campos obligatorios.',
        icon: 'error'
      });
    }
  }

 
  cancelar(): void {
    this.dialogRef.close();
  }
}


