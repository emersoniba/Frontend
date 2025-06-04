import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import Swal from 'sweetalert2';

import { PersonaService } from '../../../services/persona.service';
import { Persona, Departamento, Rol, Usuario } from '../../../models/auth.interface';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AgGridAngular, AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { ValueGetterParams, GridOptions, AllCommunityModule, ModuleRegistry, AgEventListener, AgGlobalEventListener, AgGridEvent } from 'ag-grid-community';
import { GridReadyEvent } from 'ag-grid-community';
import { BotonesComponent } from './botones/botones.component';
import { PersonaFormDialogComponent } from './persona-form-dialog/persona-form-dialog.component';
import { DepartamentoService } from '../../../services/departamento.service';
import { UsuarioFormDialogComponent } from './usuario-form-dialog/usuario-form-dialog.component';
import { RolesFormDialogComponent } from './roles-form-dialog/roles-form-dialog.component';

import { themeMaterial } from 'ag-grid-community';

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
	public dataUsuario: Usuario = {} as Usuario;
	public dataPersonas: Persona[] = [] as Persona[];
	public dataRol: Rol[] = [];
	public dataDepartamento: Departamento[] = [];
	private personaSubscriptor?: Subscription;
	public gridApi: any;
	public gridColumnApi: any;

	gridOptions: GridOptions = {
		pagination: true,
		paginationPageSize: 10,
		paginationPageSizeSelector: [10, 20, 50, 100],
		detailRowAutoHeight: true,
		domLayout: 'autoHeight',
		columnDefs: [
			{
				headerName: 'CI',
				valueGetter: params => `${params.data.ci} ${params.data?.departamento?.nombre_reducido}`,
				filter: true, floatingFilter: true,
			},
			{ headerName: 'Nombre', valueGetter: params => `${params.data.nombres} ${params.data.apellido_paterno} ${params.data.apellido_materno}`, filter: true, floatingFilter: true },
			{ headerName: 'Usuario', valueGetter: (params: ValueGetterParams) => params.data?.usuario?.username ?? 'Sin usuario', filter: true, floatingFilter: true },
			{ field: 'correo', headerName: 'Correo', filter: true, floatingFilter: true },
			{ field: 'cargo', headerName: 'Cargo', filter: true, floatingFilter: true },
			{ field: 'unidad', headerName: 'Unidad', filter: true, floatingFilter: true },
			{ field: 'telefono', headerName: 'Telefono', filter: true, floatingFilter: true },
			{
				headerName: 'Acciones',
				cellRenderer: BotonesComponent,
				field: 'ci',
				width: 130
			}
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
	};

	constructor(
		private readonly personaService: PersonaService,
		private readonly dialog: MatDialog,

	) {
		this.formPersona = new FormGroup({});
	}

	ngOnInit(): void {
		this.getPersonas();
	}

	ngOnDestroy(): void {
		this.personaSubscriptor?.unsubscribe();
	}

	onGridReady(params: GridReadyEvent): void {
		this.gridApi = params.api;
		this.gridColumnApi = (params as any).columnApi;
	}

	public getPersonas(): void {
		this.personaSubscriptor = this.personaService.getPersonasUsuario().subscribe({
			next: (response) => {
				console.log(response.data);
				this.dataPersonas = response.data as Persona[];
			},
			error: () => Swal.fire('Error', 'No se cargaron las personas', 'error')
		});
	}

	public nuevaPersona(persona?: Persona): void {
		const dialogRef = this.dialog.open(PersonaFormDialogComponent, {
			width: '40vw',
			maxWidth: '60vw',
			disableClose: true,
			data: persona
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

	public editar(ci: string) {
		const persona = this.dataPersonas.find((p) => p.ci === ci);
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

	public editarRol(ci: string): void {
		const dialogRef = this.dialog.open(RolesFormDialogComponent, {
			width: '400px',
			data: this.dataPersonas.find((p) => p.ci === ci)
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result === 'success') {
				this.getPersonas();
			}
		});
	}

	public onCellClicked(event: any): void {
		const ci = event?.ci;
		const accion = event.option;

		if (!accion || ci === undefined) return;

		if (accion === 'editar') {
			this.editar(ci);
		} else if (accion === 'eliminar') {
			this.eliminar(ci);
		} else if (accion === 'crearUsuario') {
			this.crearUsuario(ci)
		} else if (accion === 'editarRol') {
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
