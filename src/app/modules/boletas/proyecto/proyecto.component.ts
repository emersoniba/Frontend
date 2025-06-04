import { Component, OnInit } from '@angular/core';
import { ProyectoService } from '../../../services/proyecto.service';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import Swal from 'sweetalert2';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import { ProyectoModalComponent } from './proyecto-modal/proyecto-modal.component';
import { BoletasProyectoModalComponent } from '../../boletas/proyecto/boletas-proyecto-modal/boletas-proyecto-modal.component';
import { ReporteProyectoComponent } from './reporte-proyecto/reporte-proyecto.component';
import { BoletaService } from '../../../services/boleta.service';
import { Boleta } from '../../../models/boleta.model';
import { Proyecto } from '../../../models/proyecto.model';


@Component({
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatCardModule,
		AgGridModule
	],
	selector: 'app-proyecto',
	templateUrl: './proyecto.component.html',
	styleUrls: ['./proyecto.component.css']
})
export class ProyectoComponent implements OnInit {

	pagination = true;
	paginationPageSize = 5;
	proyectos: Proyecto[] = [];
	entidades: any[] = [];
	departamentos: any[] = [];
	boletasDelProyecto: any[] = [];
	proyectoSeleccionado: any = null;

	public columnDefs: ColDef[] = [
		{
			headerName: 'Nombre', field: 'nombre', filter: true,
			floatingFilter: true
		},
		{ headerName: 'Descripción', field: 'descripcion', filter: true, floatingFilter: true },
		{ headerName: 'Entidad', field: 'entidad.denominacion', filter: true, floatingFilter: true },
		{ headerName: 'Departamento', field: 'departamento.nombre', filter: true, floatingFilter: true },
		{ headerName: 'Fecha Creación', field: 'fecha_creado', filter: 'agDateColumnFilter' },
		{ headerName: 'Fecha Finalización', field: 'fecha_finalizacion', filter: 'agDateColumnFilter' },
		{
			headerName: 'Acciones',
			cellRenderer: this.accionesRenderer.bind(this),
			suppressSizeToFit: true,
			width: 150,
			cellRendererParams: {
				onClick: (event: any) => {},
			},

		}
	];

	accionesRenderer(params: any): string {
		return `
			<button class="btn-ver btn btn-secondary btn-sm"  title="Ver Boletas">📄</button>
			<button class="btn-editar btn btn-warning btn-sm" title="Editar">✏️</button>
			<button class="btn-eliminar btn btn-danger btn-sm" title="Eliminar">🗑️</button>
		`;
	}

	onCellClicked(event: any): void {
		const proyecto = event.data;
		const targetClass = event.event.target.className;

		if (targetClass.includes('btn-ver')) {
			this.verBoletas(proyecto);
		} else if (targetClass.includes('btn-editar')) {
			this.abrirModalEditar(proyecto);
		} else if (targetClass.includes('btn-eliminar')) {
			this.eliminarProyecto(proyecto.id);
		}
	}

	public defaultColDef: ColDef = {
		sortable: true,
		filter: true,
	};

	editingProyecto: Proyecto | null = null;

	constructor(
		private proyectoService: ProyectoService,
		private dialog: MatDialog,
		private boletaService: BoletaService,
	) {
	}

	ngOnInit(): void {
		this.cargarProyectos();
	}

	onGridReady(params: GridReadyEvent) {
		params.api.sizeColumnsToFit();
		params.api.addEventListener('cellClicked', (event: CellClickedEvent) => {
			const target = event.event?.target as HTMLElement;
			if (!target) return;

			const button = target.closest('.ag-card-button');

			if (button) {
				const id = button.getAttribute('data-id');
				if (id) {
					if (button.classList.contains('edit')) {
						const proyecto = this.proyectos.find(p => p.id === +id);
						if (proyecto) this.abrirModalEditar(proyecto);
					} else if (button.classList.contains('delete')) {
						this.eliminarProyecto(+id);
					}
				}
			}
		});
	}

	cargarProyectos(): void {
		this.proyectoService.getProyectos().subscribe({
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
			data: { proyecto },
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
			console.error('ID de proyecto no proporcionado');
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
				this.proyectoService.deleteProyecto(id).subscribe({
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
						console.error('Error completo al eliminar:', err);
						Swal.fire({
							title: 'Error',
							text: this.obtenerMensajeError(err),
							icon: 'error'
						});
					}
				});
			}
		});
	}

	private obtenerMensajeError(err: any): string {
		if (err.status === 404) {
			return 'El proyecto no fue encontrado.';
		} else if (err.status === 500) {
			return 'Error del servidor al intentar eliminar.';
		} else if (err.error?.message) {
			return err.error.message;
		}
		return 'Ocurrió un error al intentar eliminar el proyecto.';
	}
}
