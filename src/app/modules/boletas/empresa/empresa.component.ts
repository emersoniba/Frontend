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
import { MasterDetailModule } from 'ag-grid-enterprise';
import { BotonesComponent } from './botones/botones.component';

ModuleRegistry.registerModules([AllCommunityModule, MasterDetailModule]);

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AgGridModule, MatDialogModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatToolbarModule],
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

  constructor(
    private readonly empresaService: EmpresaService,
    private readonly actividadService: ActividadService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.formEmpresa = new FormGroup({});
    this.gridOptions = {
      getRowId: params => params.data.id.toString(),
      pagination: true,
      paginationPageSize: 8,
      masterDetail: true,
      domLayout: 'autoHeight',
      detailCellRenderer: 'agDetailCellRenderer',
      detailRowAutoHeight: true,
      detailCellRendererParams: {

        detailGridOptions: {
          columnDefs: [
            { field: 'nombre', headerName: 'Proyecto' },
            { field: 'descripcion', headerName: 'Descripción' },
            { field: 'fecha_creado', headerName: 'Inicio' },
            { field: 'fecha_finalizacion', headerName: 'Finalización' },
            {
              headerName: 'Departamento',
              valueGetter: (params: ValueGetterParams) => params.data?.departamento?.nombre
            }
          ],
          defaultColDef: {
            flex: 1,
            minWidth: 0,
            resizable: true,
            autoHeight: true,
          },
          animateRows: true,
          rowSelection: 'single'

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
        {
          field: 'denominacion', headerName: 'Empresa', filter: true, floatingFilter: true, cellRenderer: 'agGroupCellRenderer',
          cellRendererParams: { suppressCount: true, }
        },
        {
          headerName: 'Actividad', filter: true, floatingFilter: true,
          valueGetter: (params: ValueGetterParams) => params.data?.actividad?.descripcion
        },
        { field: 'nit', headerName: 'NIT', filter: true, floatingFilter: true },
        { field: 'representante_legal', headerName: 'Representante Legal', filter: true, floatingFilter: true },
        { field: 'contacto', headerName: 'Contacto', filter: true, floatingFilter: true },
        { field: 'correo', headerName: 'Correo', floatingFilter: true, filter: true },
        {
          headerName: 'Acciones',
          cellRenderer: BotonesComponent,
          width: 130
        }
      ],
      context: { componentParent: this },
      defaultColDef: {
        flex: 1,
        minWidth: 80,
        resizable: true
      },
      animateRows: true,
      rowSelection: 'single'

    };
  }

  public ngOnInit(): void {
    this.getEmpresa();
    this.getActividad();
   // this.getProyecto();

  }

  public ngOnDestroy(): void {
    this.empresaSubscriptor?.unsubscribe();
    this.proyectoSubscriptor?.unsubscribe();
  }

  public onGridReady(params: GridReadyEvent): void {
   this.gridApi = params.api;
}

  public getEmpresa(): void {
    this.empresaSubscriptor = this.empresaService.getEmpresasConProyectos().subscribe({
      next: (response) => {
        this.dataEmpresas = response;
        if (this.gridApi) {
          this.gridApi.setGridOption('rowData', this.dataEmpresas);        
        }
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
      Swal.fire('Error', 'Hubo un errror al encotrar la empresa.')
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
