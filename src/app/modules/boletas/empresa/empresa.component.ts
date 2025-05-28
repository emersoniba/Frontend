import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Actividad, Empresa } from '../../../models/empresa.interface';
import { EmpresaService } from '../../../services/empresa.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActividadService } from '../../../services/actividad.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { EmpresaFormDialogComponent } from './empresa-form-dialog/empresa-form-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import Swal from 'sweetalert2';
import { ValueGetterParams, GridReadyEvent, GridOptions, AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';

import { BotonesComponent } from './botones/botones.component';
import { themeMaterial } from 'ag-grid-community';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReporteEmpresaComponent } from './reporte-empresa/reporte-empresa.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatDialogModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatToolbarModule,
    MatExpansionModule,
    AgGridModule,
  ],

  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']

})

export class EmpresaComponent implements OnInit, OnDestroy {
  public theme = themeMaterial;
  public formEmpresa: FormGroup;
  public dataEmpresas: Empresa[] = [];
  public dataActividad: Actividad[] = [];
  public dataProyecto: Empresa[] = [];
  public gridOptions: GridOptions;
  private empresaSubscriptor?: Subscription;
  private proyectoSubscriptor?: Subscription;
  public gridApi: any;
  public columnasProyecto: string[] = ['nombre', 'descripcion', 'fecha_creado', 'fecha_finalizacion', 'departamento'];
  public empresaSeleccionada: any = null;
  public frameworkComponents: any = { botonesComponent: BotonesComponent };
  public expandedEmpresaId: number | null = null;
  public filaExpandida: number | null = null;//pruebita

  constructor(
    private readonly empresaService: EmpresaService,
    private readonly actividadService: ActividadService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    this.formEmpresa = new FormGroup({});
    this.gridOptions = {
      getRowId: params => params.data.id.toString(),
      pagination: true,
      paginationPageSize: 6,
      paginationPageSizeSelector: [6, 10, 20, 50, 100],

      domLayout: 'autoHeight',
      detailCellRenderer: 'agDetailCellRenderer',
      detailRowAutoHeight: true,

      columnDefs: [
        { field: 'denominacion', headerName: 'Empresa', filter: true, floatingFilter: true },
        { headerName: 'Actividad', filter: true, floatingFilter: true, valueGetter: (params: ValueGetterParams) => params.data?.actividad?.descripcion },
        { field: 'nit', headerName: 'NIT', filter: true, floatingFilter: true },
        { field: 'representante_legal', headerName: 'Representante Legal', filter: true, floatingFilter: true },
        { field: 'contacto', headerName: 'Contacto', filter: true, floatingFilter: true },
        { field: 'correo', headerName: 'Correo', floatingFilter: true, filter: true },
        { headerName: 'Acciones', cellRenderer: BotonesComponent, width: 130 }
      ],
      context: { componentParent: this },
      defaultColDef: {
        flex: 1,
        minWidth: 10,
        resizable: true
      },
      animateRows: true,
      rowSelection: 'single'

    };
  }

  public onRowDoubleClickedCerrar(event: any): void {
    this.empresaSeleccionada = event.data;
  }
  public onRowDoubleClicked(event: any): void {
    if (this.empresaSeleccionada && this.empresaSeleccionada.id === event.data.id) {
      this.empresaSeleccionada = null;
    } else {
      this.empresaSeleccionada = event.data;
    }
  }

  public ngOnInit(): void {
    this.getEmpresa();
    this.getActividad();
    this.getProyecto();

  }

  public ngOnDestroy(): void {
    this.empresaSubscriptor?.unsubscribe();
    this.proyectoSubscriptor?.unsubscribe();
  }

  public onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  public getEmpresa(): void {
    this.empresaSubscriptor = this.empresaService.getEmpresasConProyectos().subscribe({
      next: (response) => {
        this.dataEmpresas = response;
      },
      error: () => Swal.fire('Error', 'No se cargaron las empresas', 'error')
    });
  }

  public getActividad(): void {
    this.actividadService.getActividades().subscribe({
      next: (response) => {

        this.dataActividad = response;
      },
      error: (err) => console.error(err)
    });
  }
    public abrirDialogoReporte(): void {
  this.dialog.open(ReporteEmpresaComponent, {
    width: '450px',
    data: { empresas: this.dataEmpresas }
  });
}
  public getProyecto(): void {
    this.proyectoSubscriptor = this.empresaService.getEmpresasConProyectos().subscribe({
      next: (response) => {
        this.dataProyecto = response;
        if (this.gridApi) {
          this.gridApi.setRowData(this.dataProyecto);
        }
      },
      error: (err) => console.error(err)
    });
  }

  public nuevaEmpresa(empresa?: Empresa): void {
    const dialogRef = this.dialog.open(EmpresaFormDialogComponent, {
      width: '650px',
      disableClose: true,
      data: {
        actividades: this.dataActividad,
        empresa
      }
    });
    dialogRef.afterClosed().subscribe(result => {
       this.getEmpresa();
     });
  }
  public eliminar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la empresa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.empresaService.eliminarEmpresa(id).subscribe({
          next: () => {
            this.getEmpresa();
            Swal.fire('¡Eliminado!', 'La empresa ha sido eliminada correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Ocurrió un error al eliminar la empresa.', 'error');
          }
        });
      }
    });
  }

  public proyectos(id: number): void {
    if (this.gridApi) {
      const rowNode = this.gridApi.getRowNode(id.toString());
      if (rowNode) {
        rowNode.setExpanded(!rowNode.expanded);
      }
    } else {
      console.warn('Error con: ${id}');
    }
  }

  public editar(id: number): void {
    const empresa = this.dataEmpresas.find(e => e.id === id);
    if (empresa) {
      this.nuevaEmpresa(empresa);

    } else {
      Swal.fire('Error', 'Hubo un error al encotrar la empresa.')
    }
  }

  public onCellClicked(event: any): void {
    const action = event.event?.target?.closest('button')?.getAttribute('data-action');
    const id = event.data?.id;

    if (!action || id === undefined) return;

    if (action === 'editar') {
      this.editar(id);
    } else if (action === 'eliminar') {
      this.eliminar(id);
    } else if (action === 'proyectos') {
      this.proyectos(id);
    }
  }

  public onQuickFilterChanged(event: any): void {
    const value = event.target.value;
    if (this.gridApi) {
      this.gridApi.setQuickFilter(value);
    }
  }


}