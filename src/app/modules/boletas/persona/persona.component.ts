import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { AgGridModule } from 'ag-grid-angular';
import {
	AllCommunityModule,
	GridOptions,
	GridReadyEvent,
	ModuleRegistry,
	themeMaterial,
	ValueGetterParams,
} from 'ag-grid-community';

import { MatDialog } from '@angular/material/dialog';
import { localeEs } from '../../../shared/app.locale.es.grid';
import { MaterialModule } from '../../../shared/app.material';


import { Persona } from '../../../models/auth.interface';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { PersonaService } from '../../../services/persona.service';
import { BotonesComponent } from './botones/botones.component';
import { PersonaFormDialogComponent } from './persona-form-dialog/persona-form-dialog.component';
import { RolesFormDialogComponent } from './roles-form-dialog/roles-form-dialog.component';
import { UsuarioFormDialogComponent } from './usuario-form-dialog/usuario-form-dialog.component';


ModuleRegistry.registerModules([AllCommunityModule]);


@Component({
	selector: 'app-persona',
	standalone: true,
	imports: [
		CommonModule, AgGridModule, MaterialModule,
	],

	templateUrl: './persona.component.html',
	styleUrls: ['./persona.component.css']
})


export class PersonaComponent implements OnInit, OnDestroy {

	public theme = themeMaterial;
	public dataPersonas: Persona[] = [] as Persona[];
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
				width: 180,
				maxWidth: 180,
				minWidth: 180,
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
		localeText: localeEs,
		paginationNumberFormatter(params) {
			return params.value.toLocaleString()
		},
	};


	constructor(
		private readonly personaService: PersonaService,
		private readonly dialog: MatDialog,
		private readonly errorHandler: ErrorHandlerService
	) {
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
				this.dataPersonas = response.data as Persona[];
			},
			error: (error) => this.errorHandler.handleError(error, 'No se pudieron cargar las personas')
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
			cancelButtonText: 'Cancelar',
			allowOutsideClick: false,
			allowEscapeKey: false
		}).then((result) => {
			if (result.isConfirmed) {
				this.personaService.deletePersona(ci).subscribe({
					next: () => {
						this.getPersonas();
						Swal.fire('¡Eliminado!', 'La perssona ha sido eliminada correctamente.', 'success');
					},
					error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al eliminar la persona.')

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
					disableClose: true,
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
			error: (error) => this.errorHandler.handleError(error, 'No se pudieron cargar los roles')
		});
	}

	public editarRol(ci: string): void {
		const dialogRef = this.dialog.open(RolesFormDialogComponent, {
			width: '400px',
			disableClose: true,
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
