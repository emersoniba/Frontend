import {ChangeDetectionStrategy,Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgGridModule } from 'ag-grid-angular';
import { Subscription } from 'rxjs';

import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { AllCommunityModule, GridOptions, GridReadyEvent, ModuleRegistry, themeMaterial, ValueGetterParams } from 'ag-grid-community';
import { MaterialModule } from '../../../../shared/app.material';

import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { BotonesComponent } from '../botones/botones.component';

import Swal from 'sweetalert2';
import { Actividad } from '../../../../models/empresa.interface';
import { ActividadService } from '../../../../services/actividad.service';
import { ActividadFormDialogComponent } from './actividad-form-dialog/actividad-form-dialog.component';
import { Departamento } from '../../../../models/auth.interface';
import { DepartamentoService } from '../../../../services/departamento.service';
import { DepartamentoFormDialogComponent } from './departamento-form-dialog/departamento-form-dialog.component';


@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MaterialModule,
    MatExpansionModule,
    AgGridModule,
  ],
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActividadesComponent {
  public dataActividad: Actividad[]=[] as Actividad[];
  private actividadSubscriptor?: Subscription;
  public gridApi: any;
  public theme = themeMaterial;

  public dataDepartamento: Departamento[]=[] as Departamento[];
  private departamentoSubscriptor?: Subscription;

  

/*
  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSize: 6,
    paginationPageSizeSelector: [6, 10, 20, 50, 100],
    detailRowAutoHeight: true,
    domLayout: 'autoHeight',
    detailCellRenderer: 'agDetailCellRenderer',
    columnDefs: [
      { field: 'descripcion', headerName: 'Descripcion', filter: true, floatingFilter: true , minWidth: 300, maxWidth: 300},
      { headerName: 'Acciones', cellRenderer: BotonesComponent, field: 'id', width: 130, minWidth: 130 },
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
*/
  constructor(

    private readonly actividadService: ActividadService,
    private departamentoService: DepartamentoService,
    private dialog: MatDialog,
    private errorHandler: ErrorHandlerService

  ) { }

  public ngOnInit(): void {

    this.getActividad();
    this.getDepartamentos();
  }

  public ngOnDestroy(): void {
    this.departamentoSubscriptor?.unsubscribe();
    this.actividadSubscriptor?.unsubscribe();
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  public onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  public getActividad(): void {
    this.actividadSubscriptor=this.actividadService.getActividades().subscribe({
      next: (response) => {
        this.dataActividad = response;
      },
      error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al cargar las actividades.')
    });
  }


  public nuevaActividad(actividad?: Actividad): void {
    const dialogRef = this.dialog.open(ActividadFormDialogComponent, {
      width: '380px',
      disableClose: true,
      data: {
        actividad
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getActividad();

    });
  }

  public eliminaractividad(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la actividad permanentemente.',
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
        this.actividadService.eliminarActividad(id).subscribe({
          next: ()=>{ 
            this.getActividad();
            this.errorHandler.handleSuccess('Se eliminó la actividad', '¡Eliminado!');
          },
          error: (error)=>this.errorHandler.handleError(error, 'Ocurrio un error al eliminar la empresa.')
        });
      }
    });
  }


  public editarActividad(id: number): void {
    const actividad = this.dataActividad.find(a=> a.id === id);
    if (actividad) {
      this.nuevaActividad(actividad);
    } else {
      this.errorHandler.handleError(null, 'No se encontró la actividad con el ID proporcionado.');
    }
  }
  public clickFila(event: any): void {
    const action = event.event?.target?.closest('button')?.getAttribute('data-action');
    const id = event.data?.id;
    if (!action || id === undefined) return;
    if (action === 'editarActividad') {
      this.editarActividad(id);
    } else if (action === 'eliminarActividad') {
      this.eliminaractividad(id);
    } else if (action === 'editarDepartamento') {
      this.editarDepartamento(id);
    } else if (action === 'eliminarDepartamento') {
      this.eliminarDepartamento(id);
    }
  }

  public getDepartamentos(): void {
    this.departamentoSubscriptor=this.departamentoService.getDepartamentos().subscribe({
      next: (response) => {
        this.dataDepartamento = response;
      },
      error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al cargar las actividades.')
    });
  }


  public nuevoDepartamento(departamento?:Departamento): void {
    const dialogRef = this.dialog.open(DepartamentoFormDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        departamento
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getDepartamentos();

    });
  }

  public eliminarDepartamento(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el departamento de forma permanente.',
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
        this.departamentoService.eliminarDepartamento(id).subscribe({
          next: ()=>{ 
            this.getDepartamentos();
            this.errorHandler.handleSuccess('Se eliminó el departamento', '¡Eliminado!');
          },
          error: (error)=>this.errorHandler.handleError(error, 'Ocurrio un error al eliminar el departamento.')
        });
      }
    });
  }


  public editarDepartamento(id: number): void {
    const departamento = this.dataDepartamento.find(d=> d.id === id);
    if (departamento) {
      this.nuevoDepartamento(departamento);
    } else {
      this.errorHandler.handleError(null, 'No se encontró la actividad con el ID proporcionado.');
    }
  }
}