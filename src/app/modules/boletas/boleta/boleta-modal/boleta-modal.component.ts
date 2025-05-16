import { Component, Inject, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Estado } from '../../../../models/boleta.model';
import { EntidadFinanciera } from '../../../../models/boleta.model';
import { ProyectoService } from '../../../../services/proyecto.service';
import Swal from 'sweetalert2';
import { Boleta } from '../../../../models/boleta.model';
import { Proyecto } from '../../../../services/proyecto.service';
import { BoletaService } from '../../../../services/boleta.service';
import { EntidadFinancieraService } from '../../../../services/entidad-financiera.service';
import { environment } from '../../../../../environment/environment';
import { EstadoService } from '../../../../services/estado.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';



@Component({
  standalone: true,
  selector: 'app-boleta-modal',
  templateUrl: './boleta-modal.component.html',
  styleUrls: ['./boleta-modal.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    MatButtonModule,
    MatNativeDateModule,
    MatIconModule
  ]
})
export class BoletaModalComponent implements OnInit {
  boletaForm: FormGroup;
  isEditing: boolean = false;
  estados: Estado[] = [];
  entidadesFinancieras: EntidadFinanciera[] = [];
  proyectos: Proyecto[] = [];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BoletaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { boleta: Boleta | null },
    private boletaService: BoletaService,
    private proyectoService: ProyectoService,
    private estadoService: EstadoService,
    private entidadFinancieraService: EntidadFinancieraService
  ) {
    this.boletaForm = this.fb.group({
      tipo: ['', Validators.required],
      numero: ['', Validators.required],
      concepto: ['', Validators.required],
      entidad_financiera_id: [null, Validators.required],
      fecha_inicio: [new Date(), Validators.required],
      fecha_finalizacion: [new Date(), Validators.required],
      monto: [0, [Validators.required, Validators.min(0)]],
      cite: [''],
      estado_id: [null, Validators.required],
      proyecto_id: [null, Validators.required],
      observaciones: [''],
      nota_ejecucion: [''],
      //archivo_adjunto: [null]
      
    });
  }

  ngOnInit(): void {
    this.loadData();
    
    if (this.data.boleta) {
      this.isEditing = true;
      this.loadBoletaData(this.data.boleta);
    }
  }

  loadData(): void {
    this.loadEstados();
    this.loadEntidadesFinancieras();
    this.loadProyectos();
  }

  loadEstados(): void {
    this.estadoService.getEstados().subscribe({
      next: (data) => this.estados = data,
      error: (err) => console.error('Error cargando estados:', err)
    });
  }

  loadEntidadesFinancieras(): void {
    this.entidadFinancieraService.getEntidadesFinancieras().subscribe({
      next: (data) => this.entidadesFinancieras = data,
      error: (err) => console.error('Error cargando entidades financieras:', err)
    });
  }

  loadProyectos(): void {
    this.proyectoService.getProyectos().subscribe({
      next: (data) => this.proyectos = data,
      error: (err) => console.error('Error cargando proyectos:', err)
    });
  }

  loadBoletaData(boleta: Boleta): void {
    this.boletaForm.patchValue({
      ...boleta,
      fecha_inicio: new Date(boleta.fecha_inicio),
      fecha_finalizacion: new Date(boleta.fecha_finalizacion),
      entidad_financiera_id: boleta.entidad_financiera?.id,
      estado_id: boleta.estado.id,
      proyecto_id: boleta.proyecto.id
    });
  }

  onSubmit(): void {
    if (this.boletaForm.invalid) return;

    const formValue = this.boletaForm.value;
    const boletaData = {
      ...formValue,
      fecha_inicio: new Date(formValue.fecha_inicio).toISOString(),
      fecha_finalizacion: new Date(formValue.fecha_finalizacion).toISOString(),
      creado_por_id: 1, 
      actualizado_por_id: 1 
    };

    if (this.isEditing && this.data.boleta?.id) {
      this.updateBoleta(this.data.boleta.id, boletaData);
    } else {
      this.createBoleta(boletaData);
    }
  }

  createBoleta(boletaData: any): void {
    this.boletaService.createBoleta(boletaData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Boleta creada',
          text: 'La boleta fue registrada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error creando boleta:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la boleta'
        });
      }
    });
  }

 updateBoleta(id: number, boletaData: any): void {
  Swal.fire({
    title: '¿Está seguro?',
    text: '¿Desea actualizar esta boleta?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, actualizar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.boletaService.updateBoleta(id, boletaData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Boleta actualizada',
            text: 'La boleta fue actualizada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error actualizando boleta:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la boleta'
          });
        }
      });
    }
  });
}

}