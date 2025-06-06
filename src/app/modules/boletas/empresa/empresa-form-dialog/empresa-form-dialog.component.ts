import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MaterialModule } from '../../../../shared/app.material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

import { EmpresaService } from '../../../../services/empresa.service';
import { Actividad, Empresa } from '../../../../models/empresa.interface';
import { ActividadService } from '../../../../services/actividad.service';
import Swal from 'sweetalert2';

import { ErrorHandlerService } from '../../../../services/error-handler.service';

@Component({
  selector: 'app-empresa-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './empresa-form-dialog.component.html',
})

export class EmpresaFormDialogComponent {

  dataActividad: Actividad[] = [] as Actividad[];
  esEdicion: boolean = false;
  formEmpresa!: FormGroup;

  constructor(
    
    private fb: FormBuilder,
    private readonly actividadService: ActividadService,

    private dialogRef: MatDialogRef<EmpresaFormDialogComponent>,
    private empresaService: EmpresaService,
    private errorHandler: ErrorHandlerService,

    @Inject(MAT_DIALOG_DATA) public data: { empresa?: Empresa }
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


  ngOnInit(): void {
    this.getActividades();
  }


  public getActividades() {
    this.actividadService.getActividades().subscribe({
      next: (response) => {

        this.dataActividad = response;
      },
      error: (err) => {
        this.dataActividad = [] as Actividad[];
      }

    });

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

  public cancelar(): void {
    this.dialogRef.close();
  }

  public registrar(): void {
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
          this.esEdicion ? '¡Actualizada!' : '¡Registrada!',
          this.esEdicion
            ? 'Empresa actualizada correctamnete.'
            : 'Empresa añadida correctamente.', 'success'
        );

      },
      error: (error) => {
        if (error.status === 400 && error.error) {
          if (error.error.nit) {
            const controlNit = this.formEmpresa.get('nit');
            controlNit?.setErrors({ backend: error.error.nit[0] });
            controlNit?.markAsTouched();
          }
          if (error.error.correo) {
            const controlCorreo = this.formEmpresa.get('correo');
            controlCorreo?.setErrors({ backend: error.error.correo[0] });
            controlCorreo?.markAsTouched();
          }
          Swal.fire(
            'Error de validación',
            'Por favor revisa los campos: NIT o Correo ya están registrados en otra entidad.', 'error');
        } else {
          this.errorHandler.handleError(error, 'Ocurrió un error al registrar la empresa');
        }
      }
    });
  }


}