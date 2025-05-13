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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';


@Component({
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
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

  proyectos: Proyecto[] = [];
  entidades: any[] = [];
  departamentos: any[] = [];
  //boletas: Boleta[] = [];
  boletasColumnas: string[] = ['numero', 'tipo', 'monto', 'estado', 'concepto'];
  boletasDelProyecto: any[] = [];
  proyectoSeleccionado: any = null;


  // Configuración de AG-Grid
  public columnDefs: ColDef[] = [
    {
      headerName: 'Proyectos',
      field: 'nombre',
      flex: 1,
      cellRenderer: this.cardRenderer.bind(this),
      autoHeight: true,
      resizable: true
    }
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };

  proyectoForm: FormGroup;
  editingProyecto: Proyecto | null = null;

  constructor(
    private proyectoService: ProyectoService,
    private entidadService: EntidadService,
    private departamentoService: DepartamentoService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private http: HttpClient // <--- Agrega esto

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
    this.agGrid.api.addEventListener('cellClicked', (event: CellClickedEvent) => {
      const target = event.event?.target as HTMLElement; // Usamos optional chaining
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

  // Renderizador personalizado para las cards
  private cardRenderer(params: any): string {
    const proyecto = params.data;
    return `
      <div class="ag-card">
        <div class="ag-card-header">
          <h3>${proyecto.nombre}</h3>
        </div>
        <div class="ag-card-content">
          <p><strong>Descripción:</strong> ${proyecto.descripcion?.substring(0, 50) || ''}...</p>
          <p><strong>Entidad:</strong> ${proyecto.entidad?.denominacion || 'N/A'}</p>
          <p><strong>Depto:</strong> ${proyecto.departamento?.nombre || 'N/A'}</p>
          <p><strong>Inicio:</strong> ${new Date(proyecto.fecha_creado).toLocaleDateString()}</p>
          <p><strong>Fin:</strong> ${new Date(proyecto.fecha_finalizacion).toLocaleDateString()}</p>
        </div>
        <div class="ag-card-footer">
          <button class="ag-card-button edit" data-id="${proyecto.id}">
            <i class="material-icons">edit</i>
          </button>
          <button class="ag-card-button delete" data-id="${proyecto.id}">
            <i class="material-icons">delete</i>
          </button>
        </div>
      </div>
    `;
  }

  onGridReady(params: GridReadyEvent) {
    this.agGrid.api.sizeColumnsToFit();
  }

  // Resto de tus métodos existentes se mantienen igual...
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

 cargarProyectos(): void {
    this.proyectoService.getProyectos().subscribe({
      next: (data) => {
        this.proyectos = data;
        if (this.agGrid?.api) {
          // Forma moderna de actualizar los datos
          this.agGrid.api.setGridOption('rowData', data);
          this.agGrid.api.sizeColumnsToFit(); 
        }
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
      }
    });
  }

  abrirModalCrear(): void {
    this.editingProyecto = null;
    this.proyectoForm.reset({
      entidad_id: 1,
      departamento_id: 1,
      fecha_creado: new Date(),
      fecha_finalizacion: new Date()
    });
    
    const dialogRef = this.dialog.open(this.modalForm);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarProyectos();
      }
    });
  }

  abrirModalEditar(proyecto: Proyecto): void {
    this.editingProyecto = proyecto;
    this.proyectoForm.patchValue({
      ...proyecto,
      fecha_creado: new Date(proyecto.fecha_creado),
      fecha_finalizacion: new Date(proyecto.fecha_finalizacion)
    });
    
    const dialogRef = this.dialog.open(this.modalForm);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarProyectos();
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
      },
      error: (err) => {
        console.error('Error creando proyecto:', err);
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
          console.log('Proyecto actualizado:', updatedProyecto);
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
    if (!id) return;

    Swal.fire({
      title: '¿Eliminar proyecto?',
      text: 'No podrás deshacer esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.proyectoService.deleteProyecto(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El proyecto ha sido eliminado.', 'success');
            this.cargarProyectos();
          },
          error: (err) => {
            console.error('Error eliminando proyecto:', err);
            Swal.fire('Error', 'Hubo un problema al eliminar el proyecto.', 'error');
          }
        });
      }
    });
  }
    obtenerBoletasPorProyecto(proyectoId: number): Observable<any[]> {
      return this.http.get<any[]>('http://localhost:8000/api/entidades/con_proyectos_y_boletas/').pipe(
        map((entidades: any[]) => {
            const boletas: any[] = [];
          entidades.forEach(entidad => {
            if (entidad.proyectos) {
              entidad.proyectos.forEach((proyecto: any) => {
                if (proyecto.id === proyectoId && proyecto.boletas) {
                  boletas.push(...proyecto.boletas);
                }
              });
            }
          });
          return boletas;
        })
      );
    }

    abrirModalBoletas(proyecto: any): void {
    this.proyectoSeleccionado = proyecto;
    const proyectoId = proyecto.id;

     this.obtenerBoletasPorProyecto(proyectoId).subscribe({
      next: (boletas: any[]) => {
        this.boletasDelProyecto = boletas;
        this.dialog.open(this.modalBoletasPorProyecto, {
          data: { proyecto },
          width: '800px'

        });
      },
      error: (error) => {
        console.error('Error al cargar boletas del proyecto:', error);
      }
    });
  }
   
  calcularMontoTotal(): number {
    return this.boletasDelProyecto.reduce((total, b) => total + parseFloat(b.monto), 0);
  }

}