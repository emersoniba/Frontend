import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';
import { Subscription } from 'rxjs';

import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { GridReadyEvent, themeMaterial } from 'ag-grid-community';
import { MaterialModule } from '../../../../shared/app.material';

import { ErrorHandlerService } from '../../../../services/error-handler.service';

import Swal from 'sweetalert2';
import { Departamento } from '../../../../models/auth.interface';
import { Actividad } from '../../../../models/empresa.interface';
import { ActividadService } from '../../../../services/actividad.service';
import { DepartamentoService } from '../../../../services/departamento.service';
import { ActividadFormDialogComponent } from './actividad-form-dialog/actividad-form-dialog.component';
import { DepartamentoFormDialogComponent } from './departamento-form-dialog/departamento-form-dialog.component';
import { Tipo } from '../../../../models/boleta.model';
import { TipoService } from '../../../../services/tipo.service';
import { TipoBoletaFormDialogComponent } from './tipo-boleta-form-dialog/tipo-boleta-form-dialog.component';
import { EntidadFinanciera } from '../../../../models/boleta.model';
import { EntidadFinancieraService } from '../../../../services/entidad-financiera.service';
import { EntidadFinancieraFormDialogComponent } from './entidad-financiera-form-dialog/entidad-financiera-form-dialog.component';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MaterialModule,
    MatExpansionModule,
    AgGridModule,
  ],
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActividadesComponent {
  public dataActividad: Actividad[] = [] as Actividad[];
  private actividadSubscriptor?: Subscription;

  public dataTipo: Tipo[] = [] as Tipo[];
  private tipoSubscriptor?: Subscription;

  public dataEntidadFinanciera: EntidadFinanciera[] = [] as EntidadFinanciera[];
  private entidadFinancieraSubscriptor?: Subscription;

  public gridApi: any;
  public theme = themeMaterial;

  public dataDepartamento: Departamento[] = [] as Departamento[];
  private departamentoSubscriptor?: Subscription;

  constructor(

    private readonly actividadService: ActividadService,
    private departamentoService: DepartamentoService,
    private readonly tipoService: TipoService,
    private entidadFinancieraService: EntidadFinancieraService,
    private dialog: MatDialog,
    private errorHandler: ErrorHandlerService

  ) { }

  public ngOnInit(): void {

    this.getActividad();
    this.getDepartamentos();
    this.getTipo();
    this.getEntidadesFinancieras();
  }

  public ngOnDestroy(): void {
    this.departamentoSubscriptor?.unsubscribe();
    this.actividadSubscriptor?.unsubscribe();
    this.tipoSubscriptor?.unsubscribe();
    this.entidadFinancieraSubscriptor?.unsubscribe();
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  public onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  public getActividad(): void {
    this.actividadSubscriptor = this.actividadService.getActividades().subscribe({
      next: (response) => {
        this.dataActividad = response;
      },
      error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al cargar las actividades.')
    });
  }

  public getTipo(): void {
    this.tipoSubscriptor = this.tipoService.getTipos().subscribe({
      next: (response) => {
        this.dataTipo = response;
      },
      error: (error) => this.errorHandler.handleError(error, 'Error, no se cargaron los tipos de boletas')
    });
  }

  public getDepartamentos(): void {
    this.departamentoSubscriptor = this.departamentoService.getDepartamentos().subscribe({
      next: (response) => {
        this.dataDepartamento = response;
      },
      error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al cargar las actividades.')
    });
  }

  public getEntidadesFinancieras(): void {
    this.entidadFinancieraSubscriptor = this.entidadFinancieraService.getEntidadesFinancieras().subscribe({
      next: (response) => {
        this.dataEntidadFinanciera = response;
      },
      error: (error) => this.errorHandler.handleError(error, 'Error, no se cargaron las entidades financieras existentes.')
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

  public nuevoTipoBoleta(tipo?: Tipo): void {
    const dialogRef = this.dialog.open(TipoBoletaFormDialogComponent,
      {
        width: '380px',
        disableClose: true,
        data: { tipo }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      this.getTipo();
    });
  }

  public nuevaEntidadFinanciera(entidadFinanciera?: EntidadFinanciera): void {
    const dialogRef = this.dialog.open(EntidadFinancieraFormDialogComponent,
      {
        width: '380px',
        disableClose: true,
        data: { entidadFinanciera }

      });
    dialogRef.afterClosed().subscribe(result => {
      this.getEntidadesFinancieras();
    });
  }

  public nuevoDepartamento(departamento?: Departamento): void {
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
          next: () => {
            this.getActividad();
            this.errorHandler.handleSuccess('Se eliminó la actividad', '¡Eliminado!');
          },
          error: (error) => this.errorHandler.handleError(error, 'Ocurrio un error al eliminar la empresa.')
        });
      }
    });
  }

  public eliminarTipo(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de boleta seleccionado permanentemente.',
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
        this.tipoService.deleteTipo(id).subscribe({
          next: () => {
            this.getTipo();
            this.errorHandler.handleSuccess('Se eliminó el tipo de boleta', '¡Eliminado!');
          },
          error: (error) => this.errorHandler.handleError(error, 'Ocurrio un error al eliminar el tipo de boleta.')
        });
      }
    });
  }

  public eliminarEntidadFinanciera(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la Entidad Financiera seleccionada permanentemente.',
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
        this.entidadFinancieraService.eliminarEntidadFinanciera(id).subscribe({
          next: () => {

            this.getEntidadesFinancieras();
            this.errorHandler.handleSuccess('Se eliminó la Entidad Financiera seleccionada', '¡Eliminado!');
          },
          error: (error) => this.errorHandler.handleError(error, 'Ocurrio un error al eliminar la Entidad Financiera.')
        });
      }
    });
  }
  public eliminarDepartamento(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el departamento seleccionado permanentemente.',
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
          next: () => {
            this.getDepartamentos();
            this.errorHandler.handleSuccess('Se eliminó el Departamento seleccionado', '¡Eliminado!');
          },
          error: (error) => this.errorHandler.handleError(error, 'Ocurrio un error al eliminar el departamento.')
        });
      }
    });
  }

  public editarActividad(id: number): void {
    const actividad = this.dataActividad.find(a => a.id === id);
    if (actividad) {
      this.nuevaActividad(actividad);
    } else {
      this.errorHandler.handleError(null, 'No se encontró la actividad con el ID proporcionado.');
    }
  }

  public editarTipoBoleta(id: number): void {
    const tipo = this.dataTipo.find(b => b.id === id);
    if (tipo) {
      this.nuevoTipoBoleta(tipo);
    } else {
      this.errorHandler.handleError(null, 'No se encontró algun tipo de boleta con los datos proporcionados.')
    }
  }

  public editarEntidadFinanciera(id: number): void {
    const entidadFinanciera = this.dataEntidadFinanciera.find(e => e.id === id);
    if (entidadFinanciera) {
      this.nuevaEntidadFinanciera(entidadFinanciera);
    } else {
      this.errorHandler.handleError(null, 'No se encontró algun tipo de Entidad Financiera con los datos proporcionados.')
    }
  }

  public editarDepartamento(id: number): void {
    const departamento = this.dataDepartamento.find(d => d.id === id);
    if (departamento) {
      this.nuevoDepartamento(departamento);
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
    } else if (action === 'editarTipo') {
      this.editarTipoBoleta(id);
    } else if (action === 'eliminarTipo') {
      this.eliminarTipo(id);
    } else if (action === 'editarEntidadFinanciera') {
      this.editarEntidadFinanciera(id);
    } else if (action === 'eliminarEntidadFinanciera') {
      this.eliminarEntidadFinanciera(id);
    }
  }
}