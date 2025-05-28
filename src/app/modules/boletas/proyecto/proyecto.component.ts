import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { Proyecto, ProyectoService } from '../../../services/proyecto.service';
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
import { EntidadService } from '../../../services/entidad.service';
import { DepartamentoService } from '../../../services/departamento.service';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProyectoModalComponent } from './proyecto-modal/proyecto-modal.component';
import { BoletasProyectoModalComponent } from '../../boletas/proyecto/boletas-proyecto-modal/boletas-proyecto-modal.component';
import { ReporteProyectoComponent} from './reporte-proyecto/reporte-proyecto.component';
import { BoletaService } from '../../../services/boleta.service';


@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    AgGridModule
  ],
  selector: 'app-proyecto',
  templateUrl: './proyecto.component.html',
  styleUrls: ['./proyecto.component.css']
})
export class ProyectoComponent implements OnInit, AfterViewInit {
  @ViewChild('modalForm') modalForm!: TemplateRef<any>;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild('modalBoletasPorProyecto') modalBoletasPorProyecto!: TemplateRef<any>;

  pagination = true;
  paginationPageSize = 5;
  //paginationPageSizeSelector: [6, 10, 20, 50, 100];

  proyectos: Proyecto[] = [];
  entidades: any[] = [];
  departamentos: any[] = [];
  boletasDelProyecto: any[] = [];
  proyectoSeleccionado: any = null;
  displayedColumnsProyecto: string[] = [
    'nombre', 'descripcion', 'entidad', 'departamento',
    'fecha_creado', 'fecha_finalizacion', 'acciones'
  ];
public columnDefs: ColDef[] = [

  { headerName: 'Nombre', field: 'nombre' ,filter:true,
      floatingFilter:true},
  { headerName: 'Descripción', field: 'descripcion', filter: true,floatingFilter:true },
  { headerName: 'Entidad', field: 'entidad.denominacion', filter: true ,floatingFilter:true},
  { headerName: 'Departamento', field: 'departamento.nombre', filter: true ,floatingFilter:true},
  { headerName: 'Fecha Creación', field: 'fecha_creado', filter: 'agDateColumnFilter' },
  { headerName: 'Fecha Finalización', field: 'fecha_finalizacion', filter: 'agDateColumnFilter' },
  {
    headerName: 'Acciones',
    cellRenderer: this.accionesRenderer.bind(this),
    suppressSizeToFit: true,
    width: 150,
    cellRendererParams: {
      onClick: (event: any) => {
        console.log('Action clicked:', event);
      },
    },
  
  }
];
accionesRenderer(params: any): string {
  return `
    <button class="btn-ver btn btn-secondary btn-sm"  title="Ver Boletas">📄</button>
    <button class="btn-editar btn btn-warning btn-sm" title="Editar">✏️</button>
    <button class="btn-eliminar btn btn-danger btn-sm" title="Eliminar">🗑️</button>
  `;
}

onCellClicked(event: any): void {
  const proyecto = event.data;
  const targetClass = event.event.target.className;

  if (targetClass.includes('btn-ver')) {
    this.verBoletas(proyecto);
  } else if (targetClass.includes('btn-editar')) {
    this.abrirModalEditar(proyecto);  
  } else if (targetClass.includes('btn-eliminar')) {
    this.eliminarProyecto(proyecto.id);
  }
}


  
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };

  proyectoForm: FormGroup;
  editingProyecto: Proyecto | null = null;
  rowData: Proyecto[] = [];
  constructor(
    private proyectoService: ProyectoService,
    private entidadService: EntidadService,
    private departamentoService: DepartamentoService,
    private fb: FormBuilder,
    private dialog: MatDialog, 
    private boletaService: BoletaService,
  ) {
    this.proyectoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      entidad_id: [1, Validators.required],
      departamento_id: [1, Validators.required],
      fecha_creado: [new Date(), Validators.required],
      fecha_finalizacion: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarEntidades();
    this.cargarDepartamentos();
  }

  ngAfterViewInit() {
    // Manejador de eventos corregido
    //this.dataSource.paginator = this.paginator;

  }

  onGridReady(params: GridReadyEvent) {
    this.agGrid.api.sizeColumnsToFit();
    params.api.sizeColumnsToFit();
    params.api.addEventListener('cellClicked', (event: CellClickedEvent) => {
      const target = event.event?.target as HTMLElement;
      if (!target) return;

      const button = target.closest('.ag-card-button');
      
      if (button) {
        const id = button.getAttribute('data-id');
        if (id) {
          if (button.classList.contains('edit')) {
            const proyecto = this.proyectos.find(p => p.id === +id);
            if (proyecto) this.abrirModalEditar(proyecto);
          } else if (button.classList.contains('delete')) {
            this.eliminarProyecto(+id);
          }
        }
      }
    });
  }
  cargarEntidades(): void {
    this.entidadService.getEntidades().subscribe({
      next: (data) => {
        this.entidades = data;
      },
      error: (err) => {
        console.error('Error cargando entidades:', err);
      }
    });
  }

  cargarDepartamentos(): void {
    this.departamentoService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
      },
      error: (err) => {
        console.error('Error cargando departamentos:', err);
      }
    });
  }
//
  cargarProyectos(): void {
    this.proyectoService.getProyectos().subscribe({
      next: (data) => {
        this.proyectos = data;
        this.rowData = data; 
        if (this.agGrid?.api) {
          this.agGrid.api.setGridOption('rowData', data);
          this.agGrid.api.sizeColumnsToFit();
        }
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
      }
    });
  } 
  
   abrirDialogoReporte(): void {
    this.boletaService.getBoletas().subscribe((boletas :any) => {
      this.dialog.open(ReporteProyectoComponent, {
        width: '600px',
        
        data: { 
          proyectos: this.rowData,
          boletas: boletas
        }
      });
    });
    }
    verBoletas(proyecto: Proyecto): void {
    this.dialog.open(BoletasProyectoModalComponent, {
      width: '50vw',
      maxWidth:'90vw',
      maxHeight:'90vh',
      data: { proyecto },
      disableClose: false
    });
  }
  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(ProyectoModalComponent, {
      data: { proyecto: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.proyectoService.addProyecto(result).subscribe({
          next: () => {
            this.cargarProyectos();
            Swal.fire({
              icon: 'success',
              title: 'Proyecto creado',
              text: 'El proyecto fue registrado exitosamente',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error creando proyecto:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo crear el proyecto'
            });
          }
        });
      }
    });
  }

  abrirModalEditar(proyecto: Proyecto): void {
    const dialogRef = this.dialog.open(ProyectoModalComponent, {
      data: { proyecto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.proyectoService.updateProyecto(proyecto.id ?? 0, result).subscribe({
          next: () => {
            this.cargarProyectos();
            Swal.fire({
              icon: 'success',
              title: 'Proyecto actualizado',
              text: 'El proyecto fue modificado exitosamente',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error actualizando proyecto:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el proyecto'
            });
          }
        });
      }
    });
  }

  crearProyecto(): void {
    if (this.proyectoForm.invalid) return;

    const proyectoData = {
      ...this.proyectoForm.value,
      fecha_creado: this.proyectoForm.value.fecha_creado.toISOString().split('T')[0],
      fecha_finalizacion: this.proyectoForm.value.fecha_finalizacion.toISOString().split('T')[0],
      creado_por_id: 1,
      departamento_id: this.proyectoForm.value.departamento_id,
      entidad_id: this.proyectoForm.value.entidad_id
    };

    this.proyectoService.addProyecto(proyectoData).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.cargarProyectos();

        // ✅ SweetAlert de confirmación
        Swal.fire({
          icon: 'success',
          title: 'Proyecto creado',
          text: 'El proyecto fue registrado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error creando proyecto:', err);

        // ✅ SweetAlert de error opcional
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el proyecto'
        });
      }
    });
  }


  actualizarProyecto(): void {
    if (this.proyectoForm.invalid || !this.editingProyecto?.id) {
      console.error('Formulario inválido o falta ID del proyecto');
      return;
    }

    const proyectoData = {
      ...this.proyectoForm.value,
      id: this.editingProyecto.id,
      fecha_creado: new Date(this.proyectoForm.value.fecha_creado).toISOString().split('T')[0],
      fecha_finalizacion: new Date(this.proyectoForm.value.fecha_finalizacion).toISOString().split('T')[0],
    };

    this.proyectoService.updateProyecto(this.editingProyecto.id, proyectoData)
      .subscribe({
        next: (updatedProyecto) => {
          this.dialog.closeAll();
          this.cargarProyectos();
          this.editingProyecto = null;
        },
        error: (err) => {
          console.error('Error al actualizar:', {
            status: err.status,
            message: err.message,
            errorDetails: err.error
          });
        }
      });
  }

  eliminarProyecto(id?: number): void {
    if (!id) {
      console.error('ID de proyecto no proporcionado');
      return;
    }

    Swal.fire({
      title: '¿Eliminar proyecto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.proyectoService.deleteProyecto(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El proyecto ha sido eliminado correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            // Actualizar los datos del grid
            this.cargarProyectos();
          },
          error: (err) => {
            console.error('Error completo al eliminar:', err);
            Swal.fire({
              title: 'Error',
              text: this.obtenerMensajeError(err),
              icon: 'error'
            });
          }
        });
      }
    });
  }

  private obtenerMensajeError(err: any): string {
    if (err.status === 404) {
      return 'El proyecto no fue encontrado.';
    } else if (err.status === 500) {
      return 'Error del servidor al intentar eliminar.';
    } else if (err.error?.message) {
      return err.error.message;
    }
    return 'Ocurrió un error al intentar eliminar el proyecto.';
  }
}