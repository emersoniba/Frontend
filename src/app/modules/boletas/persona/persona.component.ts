import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PersonaService } from '../../../services/persona.service';
import { Persona, Departamento, Rol } from '../../../models/auth.interface';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AgGridModule } from 'ag-grid-angular';
import { ValueGetterParams, GridOptions, AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { GridReadyEvent } from 'ag-grid-community';
//import { MasterDetailModule } from 'ag-grid-enterprise';
import { BotonesComponent } from './botones/botones.component';
import { PersonaFormDialogComponent } from './persona-form-dialog/persona-form-dialog.component';
import { DepartamentoService } from '../../../services/departamento.service';
import { UsuarioFormDialogComponent } from './usuario-form-dialog/usuario-form-dialog.component';
import { RolesFormDialogComponent } from './roles-form-dialog/roles-form-dialog.component';
import { themeMaterial } from 'ag-grid-community';

//SIN MAESTRO DETALLE
//ModuleRegistry.registerModules([AllCommunityModule, MasterDetailModule]);
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-persona',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule, AgGridModule, MatDialogModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatToolbarModule,
  ],

  templateUrl: './persona.component.html',
  styleUrls: ['./persona.component.css']
})


export class PersonaComponent implements OnInit, OnDestroy {
  public theme = themeMaterial;

  public formPersona: FormGroup;
  public dataPersonas: Persona[] = [];
  public dataRol: Rol[] = [];
  public dataDepartamento: Departamento[] = [];
  public gridOptions: GridOptions;
  private personaSubscriptor?: Subscription;
  public gridApi: any;
  public gridColumnApi: any;

  constructor(
    private readonly personaService: PersonaService,
    private departamentoService: DepartamentoService,
    private readonly dialog: MatDialog,
    private readonly fb: FormBuilder,

  ) {
    this.formPersona = new FormGroup({});
    this.gridOptions = {
      getRowId: params => params.data.ci.toString(),
      pagination: true,
      paginationPageSize: 10,
      paginationPageSizeSelector: [10, 20, 50, 100],
      //masterDetail: true,
      detailCellRenderer: 'agDetailCellRenderer',
      detailRowAutoHeight: true,
      domLayout: 'autoHeight',

      detailCellRendererParams: {
        detailGridOptions: {

          columnDefs: [
            { field: 'id', headerName: 'Rol' },
            { field: 'nombre', headerName: 'Descripción' },],
          defaultColDef: {
            flex: 1,
            minWidth: 0,
            resizable: true,
            autoHeight: true,
          },
          animateRows: true
        },
        getDetailRowData: (params: any) => {

          if (Array.isArray(params.data?.roles)) {
            params.successCallback(params.data.roles);

          } else {
            params.successCallback([]);
          }
        }
      },
      isRowMaster: data => Array.isArray(data?.roles) && data.roles.length > 0,

      columnDefs: [

        { headerName: 'CI', 
          valueGetter: params => `${params.data.ci} ${params.data?.departamento?.nombre_reducido || ''} `, 
          filter: true, floatingFilter: true,// cellRenderer: 'agGroupCellRenderer', cellRendererParams: { suppressCount: true, } 
        },
        { headerName: 'Nombre', valueGetter: params => `${params.data.nombres} ${params.data.apellido_paterno || ''} ${params.data.apellido_materno || ''}`, filter: true, floatingFilter: true },
        { headerName: 'Usuario', valueGetter: (params: ValueGetterParams) => params.data?.usuario?.username ?? 'Sin usuario', filter: true, floatingFilter: true },
        { field: 'correo', headerName: 'Correo', filter: true, floatingFilter: true },
        { field: 'cargo', headerName: 'Cargo', filter: true, floatingFilter: true },
        { field: 'unidad', headerName: 'Unidad', filter: true, floatingFilter: true },
        { field: 'telefono', headerName: 'Telefono', filter: true, floatingFilter: true },
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
      //rowSelection: {type: 'single',},
      rowSelection: 'single',
    };
  }

  ngOnInit(): void {

    this.getDepartamento();
  }

  ngOnDestroy(): void {
    this.personaSubscriptor?.unsubscribe();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = (params as any).columnApi;
    this.getPersonas();
    this.getRoles();
  }

  public getPersonas(): void {
    this.personaSubscriptor = this.personaService.getPersonasUsuario().subscribe({
      next: (response) => {

        this.dataPersonas = response.map((item: any) => ({ ...item.persona, usuario: item.usuario, roles: item.roles }));
        if (this.gridApi) {

          this.gridApi.setRowData(this.dataPersonas);
        }
      },
      error: () => Swal.fire('Error', 'No se cargaron las personas', 'error')
    });
  }
  public getRoles(): void {
    this.personaService.getRoles().subscribe({
      next: (response) => {
        this.dataRol = response;
      },
      error: (err) => console.error(err)
    });
  }

  public getDepartamento(): void {
    this.departamentoService.getDepartamentos().subscribe({
      next: (response) => {

        this.dataDepartamento = response;
      },
      error: (err) => console.error(err)
    });
  }

  public nuevaPersona(persona?: Persona): void {
    const dialogRef = this.dialog.open(PersonaFormDialogComponent, {

      width: '40vw',
      maxWidth: '60vw',//configurar para movils
      disableClose: true,
      data: {
        departamentos: this.dataDepartamento,
        persona
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPersonas();
        Swal.fire(
          persona ? '¡Actualizado!' : '¡Registrado!',
          persona
            ? 'La persona ha sido actualizada correctamente.'
            : 'La persona ha sido registrada exitosamente.',
          'success'
        );
      }
    });
  }

  public eliminar(ci: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la persona.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.personaService.deletePersona(ci).subscribe({
          next: () => {
            this.getPersonas();
            Swal.fire('¡Eliminado!', 'La perssona ha sido eliminada correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Ocurrió un error al eliminar la persona.', 'error');
          }
        });
      }
    });
  }

  public eliminarUsuario(ci: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el usuario asociado a la persona.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.personaService.deleteUsuario(ci).subscribe({
          next: () => {
            this.getPersonas();
            Swal.fire('¡Eliminado!', 'Usuario eliminado correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Ocurrió un error al eliminar usuario asociado a persona.', 'error');
          }
        });
      }
    });
  }
  public editar(ci: string): void {
    const persona = this.dataPersonas.find(p => p.ci === ci);
    if (persona) {

      this.nuevaPersona(persona);
    } else {
      Swal.fire('Error', 'No se encontró la persona.', 'error');
    }
  }

  public crearUsuario(ci: number): void {

    this.personaService.getRoles().subscribe({
      next: (rolesDisponibles) => {
        const dialogRef = this.dialog.open(UsuarioFormDialogComponent, {
          width: '400px',
          data: { rolesDisponibles, modo: 'crear' }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result && result.roles.length > 0) {
            this.personaService.postCrearUsuarioPersona(ci, { roles: result.roles }).subscribe({
              next: (response) => {
                Swal.fire('Éxito', `Usuario creado: ${response.username}`, 'success');
                this.getPersonas();
              },
              error: (err) => {
                const msg = err?.error?.message || 'No se pudo crear el usuario';
                Swal.fire('Error', msg, 'error');
              }
            });
          }
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
      }
    });
  }
  public editarRol(ci: number): void {
    const dialogRef = this.dialog.open(RolesFormDialogComponent, {
      width: '400px',
      data: { ci }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.getPersonas();
      }
    });
  }


  public onCellClicked(event: any): void {
    const action = event.event?.target?.closest('button')?.getAttribute('data-action');
    const ci = event.data?.ci;

    if (!action || ci === undefined) return;

    if (action === 'editar') {
      this.editar(ci);
    } else if (action === 'eliminar') {
      this.eliminar(ci);
    } else if (action === 'crearUsuario') {
      this.crearUsuario(ci)
    } else if (action === 'editarRol') {
      this.editarRol(ci)
    }
  }

  public onQuickFilterChanged(event: any): void {
    const value = event.target.value;
    if (this.gridApi) {
      this.gridApi.setQuickFilter(value);
    }
  }
}
