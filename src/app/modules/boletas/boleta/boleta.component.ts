import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BoletaService } from '../../../services/boleta.service';
import { Boleta, Estado, EntidadFinanciera } from '../../../models/boleta.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { Proyecto, ProyectoService } from '../../../services/proyecto.service';
import { EntidadService } from '../../../services/entidad.service';
import { EntidadFinancieraService } from '../../../services/entidad-financiera.service';
import { EstadoService } from '../../../services/estado.service';
import Swal from 'sweetalert2';
//v1
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  selector: 'app-boleta',
  templateUrl: './boleta.component.html',
  styleUrls: ['./boleta.component.css']
})
export class BoletaComponent implements OnInit {
  @ViewChild('modalForm') modalForm!: TemplateRef<any>;
  
  boletas: Boleta[] = [];
  estados: Estado[] = [];
  entidadesFinancieras: EntidadFinanciera[] = [];
  proyectos: Proyecto[] = [];

  // Actualiza las columnas a mostrar
  displayedColumns: string[] = [
    'numero', 
    'tipo', 
    'concepto', 
    'monto', 
    'cite',
    'entidad_financiera',
    'fecha_inicio',
    'fecha_finalizacion',
    'estado',
    'proyecto',
    'nota_ejecucion',
    'acciones'
  ];
   
  getNombreProyecto(proyectoId: number): string {
    const proyecto = this.proyectos.find(p => p.id === proyectoId);
    return proyecto ? proyecto.nombre : 'Proyecto no encontrado';
  }
  boletaForm: FormGroup;
  editingBoleta: Boleta | null = null;

  constructor(
    private boletaService: BoletaService,
    private proyectoService: ProyectoService,
   // private entidadService: EntidadService,
    private estadoService: EstadoService,
    //private entidadFinancieraService: EntidadFinancieraService,
    private entidadFinancieraService: EntidadService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.boletaForm = this.fb.group({
      tipo: ['', Validators.required],
      numero: ['', Validators.required],
      concepto: ['', Validators.required],
      entidad_financiera: [null],
      fecha_inicio: [new Date(), Validators.required],
      fecha_finalizacion: [new Date(), Validators.required],
      monto: [0, [Validators.required, Validators.min(0)]],
      cite: [''],
      estado: [null, Validators.required],
      proyecto: [null, Validators.required],
      observaciones: [''],
      nota_ejecucion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarBoletas();
    this.cargarEstados();
    this.cargarEntidadesFinancieras();
    this.cargarProyectos();
  }

  cargarBoletas(): void {
    this.boletaService.getBoletas().subscribe({
      next: (data) => {
        this.boletas = data;
        console.log("xxxxxxxxxx",data);

      },
      error: (err) => {
        console.error('Error cargando boletas:', err);
      }
    });
  }

  cargarEstados(): void {
    this.estadoService.getEstados().subscribe({
      next: (data) => {
        this.estados = data;
                console.log("xxxxxxxxxx",data);

      },
      error: (err) => {
        console.error('Error cargando estados:', err);
      }
    });
  }

  cargarEntidadesFinancieras(): void {
    this.entidadFinancieraService.getEntidades().subscribe({
      next: (data) => {
        this.entidadesFinancieras = data;
                console.log("xxxxxxxxxx",data);

      },
      error: (err) => {
        console.error('Error cargando entidades financieras:', err);
      }
    });
  }

  cargarProyectos(): void {
    this.proyectoService.getProyectos().subscribe({
      next: (data) => {
        this.proyectos = data;
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
      }
    });
  }

  abrirModalCrear(): void {
    this.editingBoleta = null;
    this.boletaForm.reset({
      fecha_inicio: new Date(),
      fecha_finalizacion: new Date(),
      monto: 0
    });
    
    const dialogRef = this.dialog.open(this.modalForm);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarBoletas();
      }
    });
  }

  abrirModalEditar(boleta: Boleta): void {
    this.editingBoleta = boleta;
    this.boletaForm.patchValue({
      ...boleta,
      fecha_inicio: new Date(boleta.fecha_inicio),
      fecha_finalizacion: new Date(boleta.fecha_finalizacion),
      entidad_financiera: boleta.entidad_financiera?.id || null,
      estado: boleta.estado.id,
      proyecto: boleta.proyecto
    });
    
    const dialogRef = this.dialog.open(this.modalForm);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarBoletas();
      }
    });
  }

  crearBoleta(): void {
    if (this.boletaForm.invalid) return;
    
    const boletaData = {
      ...this.boletaForm.value,
      fecha_inicio: this.boletaForm.value.fecha_inicio.toISOString(),
      fecha_finalizacion: this.boletaForm.value.fecha_finalizacion.toISOString(),
      creado_por_id: 1, // Ajusta según tu sistema de autenticación
      entidad_financiera: this.boletaForm.value.entidad_financiera,
      estado: this.boletaForm.value.estado,
      proyecto: this.boletaForm.value.proyecto
    };
    
    this.boletaService.createBoleta(boletaData).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.cargarBoletas();
      },
      error: (err) => {
        console.error('Error creando boleta:', err);
      }
    });
  }

  actualizarBoleta(): void {
    if (this.boletaForm.invalid || !this.editingBoleta?.id) return;

    const boletaData = {
      ...this.boletaForm.value,
      id: this.editingBoleta.id,
      fecha_inicio: new Date(this.boletaForm.value.fecha_inicio).toISOString(),
      fecha_finalizacion: new Date(this.boletaForm.value.fecha_finalizacion).toISOString(),
      actualizado_por_id: 1, // Ajusta según tu sistema de autenticación
      entidad_financiera: this.boletaForm.value.entidad_financiera,
      estado: this.boletaForm.value.estado,
      proyecto: this.boletaForm.value.proyecto
    };

    this.boletaService.updateBoleta(this.editingBoleta.id, boletaData)
      .subscribe({
        next: () => {
          this.dialog.closeAll();
          this.cargarBoletas();
          this.editingBoleta = null;
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
        }
      });
  }

  eliminarBoleta(id?: number): void {
    if (!id) return;

    Swal.fire({
      title: '¿Eliminar boleta?',
      text: 'No podrás deshacer esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.boletaService.deleteBoleta(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La boleta ha sido eliminada.', 'success');
            this.cargarBoletas();
          },
          error: (err) => {
            console.error('Error eliminando boleta:', err);
            Swal.fire('Error', 'Hubo un problema al eliminar la boleta.', 'error');
          }
        });
      }
    });
  }
}