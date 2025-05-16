import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { EmpresaService } from '../../../../services/empresa.service';

@Component({
  selector: 'app-empresa-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    MatButtonModule, MatSelectModule],
  templateUrl: './empresa-form-dialog.component.html',
})

export class EmpresaFormDialogComponent {
  formEmpresa!: FormGroup;
  esEdicion: boolean = false; // edicion adicon

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmpresaFormDialogComponent>,
   // private empresaService: EmpresaService,
    @Inject(MAT_DIALOG_DATA) public data: { actividades: any[], empresa?: any }
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

 registrar(): void {
    if (this.formEmpresa.valid) {
      this.dialogRef.close(this.formEmpresa.value);
    }
  }
 
  cancelar(): void {
    this.dialogRef.close();
  }
}


