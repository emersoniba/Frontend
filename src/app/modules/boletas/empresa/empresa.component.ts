import { Component, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { AgGridModule } from 'ag-grid-angular';
import { Subscription } from 'rxjs';

import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { AllCommunityModule, GridOptions, GridReadyEvent, ModuleRegistry, themeMaterial, ValueGetterParams } from 'ag-grid-community';
import { MaterialModule } from '../../../shared/app.material';

import { Empresa, Proyecto } from '../../../models/empresa.interface';
import { EmpresaService } from '../../../services/empresa.service';

import { ErrorHandlerService } from '../../../services/error-handler.service';
import { BotonesComponent } from './botones/botones.component';
import { EmpresaFormDialogComponent } from './empresa-form-dialog/empresa-form-dialog.component';
import { ReporteEmpresaComponent } from './reporte-empresa/reporte-empresa.component';

import Swal from 'sweetalert2';
import { localeEs } from '../../../shared/app.locale.es.grid';


ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MaterialModule,
    MatExpansionModule,
    AgGridModule,
  ],

  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']

})


export class EmpresaComponent implements OnInit, OnDestroy {

  public dataProyecto: Proyecto[] = [];
  public dataEmpresas: Empresa[] = [] as Empresa[];
  public columnasProyecto: string[] = ['nombre', 'descripcion', 'fecha_creado', 'fecha_finalizacion', 'departamento'];

  private proyectoSubscriptor?: Subscription;
  private empresaSubscriptor?: Subscription;

  public empresaSeleccionada: any = null;
  public gridApi: any;
  public theme = themeMaterial;

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 6,
    paginationPageSizeSelector: [6, 10, 20, 50, 100],
    detailRowAutoHeight: true,
    domLayout: 'autoHeight',
    detailCellRenderer: 'agDetailCellRenderer',
    columnDefs: [
      { field: 'denominacion', headerName: 'Empresa', filter: true, floatingFilter: true },
      { headerName: 'Actividad', filter: true, floatingFilter: true, valueGetter: (params: ValueGetterParams) => params.data?.actividad?.descripcion },
      { field: 'nit', headerName: 'NIT', filter: true, floatingFilter: true },
      { field: 'representante_legal', headerName: 'Representante Legal', filter: true, floatingFilter: true },
      { field: 'contacto', headerName: 'Contacto', filter: true, floatingFilter: true },
      { field: 'correo', headerName: 'Correo', floatingFilter: true, filter: true },
      { headerName: 'Acciones', cellRenderer: BotonesComponent, field: 'id', width: 130 },
    ],
    context: {
      componentParent: this
    },
    defaultColDef: {
      flex: 1,
      minWidth: 80,
      resizable: true
    },
    animateRows: true,
    rowSelection: 'single',
    localeText: localeEs,
    paginationNumberFormatter(params) {
      return params.value.toLocaleString()
    },
  };

  constructor(

    private readonly empresaService: EmpresaService,
    private dialog: MatDialog,
    private errorHandler: ErrorHandlerService

  ) { }

  public cerrarProyecto(event: any): void {
    this.empresaSeleccionada = null;
    this.dataProyecto = [];
  }

  public abrirProyecto(event: any): void {
    if (this.empresaSeleccionada && this.empresaSeleccionada.id === event.data.id) {
      this.cerrarProyecto(event);
    } else {
      this.empresaSeleccionada = event.data;
      this.getProyectosEmpresaporId(this.empresaSeleccionada.id);
    }
  }

  public getProyectosEmpresaporId(id: number): void {
    this.proyectoSubscriptor = this.empresaService.getEmpresasConProyectos(id).subscribe({
      next: (response) => {
        this.dataProyecto = response.data as Proyecto[];
      },
      error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al cargar los proyectos de la empresa.')
    });
  }



  public ngOnInit(): void {

    this.getEmpresa();
  }

  public ngOnDestroy(): void {
    this.empresaSubscriptor?.unsubscribe();
    this.proyectoSubscriptor?.unsubscribe();
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  public onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  public getEmpresa(): void {
    this.empresaSubscriptor = this.empresaService.getEmpresas().subscribe({
      next: (response) => {
        this.dataEmpresas = response;
      },
      error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al cargar las empresas.')
    });
  }

  public abrirDialogoReporte(): void {
    this.dialog.open(ReporteEmpresaComponent, {
      width: '480px',
      data: { empresas: this.dataEmpresas }
    });
  }

  public nuevaEmpresa(empresa?: Empresa): void {
    const dialogRef = this.dialog.open(EmpresaFormDialogComponent, {
      width: '650px',
      disableClose: true,
      data: {
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
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.empresaService.eliminarEmpresa(id).subscribe({
          next: () => {
            this.getEmpresa();
            this.errorHandler.handleSuccess('La empresa ha sido eliminada correctamente.', '¡Eliminado!');
          },
          error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al eliminar la empresa.')
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
      this.errorHandler.handleError(null, 'Error al intentar expandir la fila de proyectos.');
    }
  }

  public editar(id: number): void {
    const empresa = this.dataEmpresas.find(e => e.id === id);
    if (empresa) {
      this.nuevaEmpresa(empresa);

    } else {
      this.errorHandler.handleError(null, 'No se encontró la empresa con el ID proporcionado.');
    }
  }

  public clickFila(event: any): void {

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

}