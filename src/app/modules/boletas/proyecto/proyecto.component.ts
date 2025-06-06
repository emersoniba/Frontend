import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { GridReadyEvent, GridApi, GridOptions } from 'ag-grid-community';
import { themeMaterial } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { BoletasProyectoModalComponent } from '../../boletas/proyecto/boletas-proyecto-modal/boletas-proyecto-modal.component';
import { ProyectoModalComponent } from './proyecto-modal/proyecto-modal.component';
import { ReporteProyectoComponent } from './reporte-proyecto/reporte-proyecto.component';
import { BotonesProyectoComponent } from './botones-proyecto/botones-proyecto.component';

import { ProyectoService } from '../../../services/proyecto.service';
import { BoletaService } from '../../../services/boleta.service';
import { Boleta } from '../../../models/boleta.model';
import { Proyecto } from '../../../models/proyecto.model';
import { localeEs } from '../../../shared/app.locale.es.grid';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../../shared/app.material';


@Component({
	standalone: true,
	imports: [
		CommonModule,
		MaterialModule,
		AgGridModule,
		AgGridAngular,
	],
	selector: 'app-proyecto',
	templateUrl: './proyecto.component.html',
	styleUrls: ['./proyecto.component.css']
})
export class ProyectoComponent implements OnInit, OnDestroy {

	public theme = themeMaterial;
	public proyectos: Proyecto[] = [] as Proyecto[];
	private proyectoSubcription: Subscription | undefined;
	private boletasSubcription: Subscription | undefined;

	private gridApi!: GridApi<Proyecto>;
	private gridColumnApi: any;
	public getRowId = (params: Proyecto) => params.id;
	gridOptions: GridOptions = <GridOptions>{
		pagination: true,
		paginationPageSize: 10,
		paginationPageSizeSelector: [10, 20, 50, 100],
		detailRowAutoHeight: true,
		domLayout: 'autoHeight',
		columnDefs: [
			{ headerName: 'Nombre', field: 'nombre', filter: true, floatingFilter: true },
			{ headerName: 'Descripción', field: 'descripcion', filter: true, floatingFilter: true },
			{ headerName: 'Entidad', field: 'entidad.denominacion', filter: true, floatingFilter: true },
			{ headerName: 'Departamento', field: 'departamento.nombre', filter: true, floatingFilter: true },
			{
				headerName: 'Fecha Inicio',
				field: 'fecha_creado',
				filter: 'agDateColumnFilter',
				valueFormatter: (params: any) => {
					if (!params.value) return '';
					const [year, month, day] = params.value.split('-').map((v: string) => parseInt(v, 10));
					return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
				}
			},
			{
				headerName: 'Fecha Finalización',
				field: 'fecha_finalizacion',
				filter: 'agDateColumnFilter',
				valueFormatter: (params: any) => {
					if (!params.value) return '';
					const [year, month, day] = params.value.split('-').map((v: string) => parseInt(v, 10));
					return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
				}
			},
			{
				headerName: 'Acciones',
				cellRenderer: BotonesProyectoComponent,
				field: 'id',
				width: 190
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
		private proyectoService: ProyectoService,
		private dialog: MatDialog,
		private boletaService: BoletaService,
	) {
	}

	ngOnInit(): void {
		this.cargarProyectos();
	}

	ngOnDestroy(): void {
		this.proyectoSubcription?.unsubscribe();
	}

	cargarProyectos(): void {
		this.proyectoSubcription = this.proyectoService.getProyectos().subscribe({
			next: (response) => {
				this.proyectos = response;
			},
			error: (err) => {
				this.proyectos = [] as Proyecto[];
			}
		});
	}

	abrirDialogoReporte(): void {
		this.boletaService.getBoletas().subscribe((boletas: Boleta[]) => {
			this.dialog.open(ReporteProyectoComponent, {
				width: '600px',
				data: {

					proyectos: this.proyectos,
					boletas: boletas
				}
			});
		});
	}

	verBoletas(proyecto: Proyecto): void {
		this.dialog.open(BoletasProyectoModalComponent, {
			width: '50vw',
			maxWidth: '90vw',
			maxHeight: '90vh',
			data: proyecto,
			disableClose: false
		});
	}

	abrirModalCrear(): void {
		const dialogRef = this.dialog.open(ProyectoModalComponent, {
			disableClose: true,
			data: {} as Proyecto
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarProyectos();
			}
		});
	}

	abrirModalEditar(proyecto: Proyecto): void {
		const dialogRef = this.dialog.open(ProyectoModalComponent, {
			disableClose: true,
			data: proyecto
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarProyectos();
			}
		});
	}

	eliminarProyecto(id?: number): void {
		if (!id) {
			return;
		}

		Swal.fire({
			title: '¿Eliminar proyecto?',
			text: 'Esta acción no se puede deshacer',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.isConfirmed) {
				this.proyectoSubcription = this.proyectoService.deleteProyecto(id).subscribe({
					next: () => {
						Swal.fire({
							title: '¡Eliminado!',
							text: 'El proyecto ha sido eliminado correctamente.',
							icon: 'success',
							timer: 2000,
							showConfirmButton: false
						});
						this.cargarProyectos();
					},
					error: (err) => {
						Swal.fire({
							title: 'Error',
							text: 'Error Error',
							icon: 'error'
						});
					}
				});
			}
		});
	}

	public onGridReady(params: GridReadyEvent<Proyecto>) {
		this.gridApi = params.api;
		this.gridApi.sizeColumnsToFit();
	}

	public onCellClicked(event: any): void {
		const proyecto = event.proyecto;

		if (event.option === 'verboletas') {
			this.verBoletas(proyecto);
			return;
		}

		if (event.option === 'editar') {
			this.abrirModalEditar(proyecto);
			return;
		}

		if (event.option === 'eliminar') {
			this.eliminarProyecto(proyecto.id);
			return;
		}

		return;
	}
}
