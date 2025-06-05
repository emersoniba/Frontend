import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


import {  MAT_DIALOG_DATA } from '@angular/material/dialog';
import {  MatDialogRef } from '@angular/material/dialog';

import { EmpresaService } from '../../../../services/empresa.service';
import { Actividad, Empresa } from '../../../../models/empresa.interface';
import { ActividadService } from '../../../../services/actividad.service';
import Swal from 'sweetalert2';

import { MaterialModule } from '../../../../shared/app.material';

@Component({
  selector: 'app-empresa-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './empresa-form-dialog.component.html',
})

export class EmpresaFormDialogComponent {
  formEmpresa!: FormGroup;
  esEdicion: boolean = false;
  dataActividad: Actividad[] = [] as Actividad[];

  constructor(
    private fb: FormBuilder,
    private readonly actividadService: ActividadService,

    private dialogRef: MatDialogRef<EmpresaFormDialogComponent>,
    private empresaService: EmpresaService,
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
        console.log('Actividades obtenidas:', response);
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



  cancelar(): void {
    this.dialogRef.close();
  }
  registrar(): void {
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