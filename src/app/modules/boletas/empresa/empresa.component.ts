import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Actividad, Empresa } from '../../../models/empresa.interface';
import { EmpresaService } from '../../../services/empresa.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActividadService } from '../../../services/actividad.service';
import { ProyectoService } from '../../../services/proyecto.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
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
import { ValueGetterParams } from 'ag-grid-community';

import { GridOptions, IDetailCellRendererParams } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { GridReadyEvent } from 'ag-grid-community';
/*esto*/
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

import { MasterDetailModule } from 'ag-grid-enterprise'; 
ModuleRegistry.registerModules([ MasterDetailModule ]); 
/**hast aaqui */
@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, AgGridModule,
    MatDialogModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatToolbarModule
  ],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['denominacion', 'nit', 'actividad', 'representante_legal', 'contacto', 'correo', 'acciones'];

  public formEmpresa: FormGroup;
  public dataEmpresas: Empresa[] = [];
  public dataActividad: Actividad[] = [];
  public dataProyecto: Empresa[] = [];
  public gridOptions: GridOptions;

  private empresaSubscriptor?: Subscription;
  private proyectoSubscriptor?: Subscription;
  public gridApi: any;
  private gridColumnApi: any;

  constructor(
    private readonly empresaService: EmpresaService,
    private readonly actividadService: ActividadService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.formEmpresa = new FormGroup({});


    this.gridOptions = {
      masterDetail: true,
      //getRowId: params => params.data.id.toString(),
      getRowId: params => params.data.id.toString(),
      //getRowNodeId: data => data.id.toString(), 
      detailCellRenderer: 'agDetailCellRenderer',
      detailRowAutoHeight: true,
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            { field: 'nombre', headerName: 'Proyecto' },
            { field: 'descripcion', headerName: 'Descripción' },
            { field: 'fecha_creado', headerName: 'Creación' },
            { field: 'fecha_finalizacion', headerName: 'Fin' },
            {
              headerName: 'Departamento',
                  valueGetter: (params: ValueGetterParams) => params.data?.departamento?.nombre
            }
          ],
          defaultColDef: {
            flex: 1,
            minWidth: 100,
            resizable: true
          }
        },
        getDetailRowData: (params: any) => {
            if (Array.isArray(params.data?.proyectos)) {
              params.successCallback(params.data.proyectos);
            } else {
              params.successCallback([]);
            }
          }
      },
      isRowMaster: data => Array.isArray(data?.proyectos) && data.proyectos.length > 0,
      columnDefs: [
        { field: 'denominacion', headerName: 'Empresa' },
        { field: 'nit', headerName: 'NIT' },
        { field: 'actividad?.descripcion', headerName: 'Actividad' },
        { field: 'representante_legal', headerName: 'Representante Legal' },
        { field: 'contacto', headerName: 'Contacto' },
        { field: 'correo', headerName: 'Correo' }
      ],
      defaultColDef: {
        flex: 1,
        minWidth: 120,
        resizable: true
      },
      animateRows: true,
      rowSelection: 'single'
    };
  }

  ngOnInit(): void {
    this.getEmpresa();
    this.getActividad();
    //this.getProyecto();
  }

  ngOnDestroy(): void {
    this.empresaSubscriptor?.unsubscribe();
    this.proyectoSubscriptor?.unsubscribe();
  }

  
  
onGridReady(params: GridReadyEvent) {
  this.gridApi = params.api;
  this.gridColumnApi =(params as any).columnApi;/**/ 
}


  getEmpresa(): void {
    this.empresaSubscriptor = this.empresaService.getEmpresasConProyectos().subscribe({
      next: (response) => this.dataEmpresas = response,
      error: () => Swal.fire('Error', 'No se cargaron las empresas', 'error')
    });
  }

  getActividad(): void {
    this.actividadService.getActividades().subscribe({
      next: (response) => this.dataActividad = response,
      error: (err) => console.error(err)
    });
  }

  getProyecto(): void {
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
public editar(id: number): void {
    const empresa = this.dataEmpresas.find(e => e.id === id);
    if (empresa) {
      this.nuevaEmpresa(empresa);
    }
  }

  public proyectos(id: number): void {
    if (this.gridApi) {
      const rowNode = this.gridApi.getRowNode(id.toString());
      if (rowNode) {
        rowNode.setExpanded(!rowNode.expanded);
      }
    } else {
      console.warn('Grid API not initialized yet.');
    }
  }

/*
public proyectos(id: number): void {
    const empresa = this.dataProyecto.find(e => e.id === id);
    if (empresa) {
      this.proyectos_asociados(empresa);
    }
  }
  public proyectos_asociados(empresa?: Empresa): void {
    this.proyectoSubscriptor = this.empresaService.getEmpresasConProyectos().subscribe({
      next: (response) => {
        this.dataProyecto = response;
        console.log('Proyectos asociados cargados:', response);
      },
      error: (err) => {
        console.error('Error al cargar proyectos asociados:', err);
      }
    });
  }*/

  nuevaEmpresa(empresa?: Empresa): void {
    const dialogRef = this.dialog.open(EmpresaFormDialogComponent, {
      width: '650px',
      data: { actividades: this.dataActividad, empresa }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const save$ = empresa
          ? this.empresaService.putEmpresa(result.id!, result)
          : this.empresaService.postEmpresa(result);

        save$.subscribe({
          next: () => this.getEmpresa(),
          error: (error) => {
            if (error.status === 400 && error.error.nit) {
              Swal.fire('NIT duplicado', error.error.nit[0], 'error');
            } else {
              Swal.fire('Error', 'No se pudo guardar la empresa.', 'error');
            }
          }
        });
      }
    });
  }

  eliminar(id: number): void {
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
}
