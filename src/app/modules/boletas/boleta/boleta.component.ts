import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgGridModule } from 'ag-grid-angular';
import { GridApi, GridOptions, GridReadyEvent, ICellRendererParams, themeMaterial } from 'ag-grid-community';
import Swal from 'sweetalert2';

import { Subscription } from 'rxjs';
import { Boleta } from '../../../models/boleta.model';
import { BoletaService } from '../../../services/boleta.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { MaterialModule } from '../../../shared/app.material';
import { BoletaModalComponent } from './boleta-modal/boleta-modal.component';
import { BotonesComponent } from './botones/botones.component';
import { ReporteBoletasComponent } from './reporte-boletas/reporte-boletas.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';


import { OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import { localeEs } from '../../../shared/app.locale.es.grid';
ModuleRegistry.registerModules([AllCommunityModule]);


@Component({
	standalone: true,
	selector: 'app-boleta',
	templateUrl: './boleta.component.html',
	styleUrls: ['./boleta.component.css'],
	encapsulation: ViewEncapsulation.None,
	imports: [CommonModule, AgGridModule, MaterialModule,
		ReactiveFormsModule,
		MatExpansionModule,
	],
	providers: [DatePipe]
})


export class BoletaComponent implements OnInit, OnDestroy {
	public theme = themeMaterial;
	public dataBoletas: Boleta[] = [] as Boleta[];
	private boletaSubscriptor?: Subscription;

	loading = false;
	private gridApi!: GridApi;


	gridOptions: GridOptions = {
		pagination: true,
		paginationPageSize: 6,
		paginationPageSizeSelector: [6, 10, 20, 50, 100],
		detailRowAutoHeight: true,
		domLayout: 'autoHeight',
		detailCellRenderer: 'agDetailCellRenderer',
		suppressScrollOnNewData: true,
		columnDefs: [
			{
				//pinned: 'left',
				headerName: 'Días para Vencimiento', field: 'dias_para_vencimiento', width: 150, maxWidth: 150, minWidth: 150, flex: 2,
				cellRenderer: (params: ICellRendererParams) => {
					const dias = params.value;
					if (dias === undefined || dias === null) return '-';
					let texto = '', clase = '';
					if (dias > 15) {
						texto = `Faltan ${dias} días hábiles`; clase = 'dias-verde';
					} else if (dias > 3) {
						texto = `Faltan ${dias} días hábiles`; clase = 'dias-amarillo';
					} else if (dias >= 0) {
						texto = `Faltan ${dias} días hábiles`; clase = 'dias-rojo';
					} else {
						texto = `Venció hace ${Math.abs(dias)} días hábiles`; clase = 'dias-vencido';
					}
					return `<span class="dias-restantes ${clase}">${texto}</span>`;
				}
			},

			{
				headerName: 'Estado', field: 'estado.nombre', width: 140, maxWidth: 140, minWidth: 140,
				cellRenderer: (params: ICellRendererParams) => {
					const icon = params.data.estado?.icono || 'info';
					const nombre = params.data.estado?.nombre || '';
					return `<span><span class="material-icons" style="font-size: 18px;">${icon}</span> ${nombre}</span>`;
				},
				valueGetter: (params) => params.data.estado?.nombre || ''
			},
			{ headerName: 'Número', field: 'numero', minWidth: 150, flex: 1, filter: true, floatingFilter: true },
			{ headerName: 'Tipo', field: 'tipo_boleta.nombre', minWidth: 170, flex: 2, filter: true, floatingFilter: true },
			{ headerName: 'Concepto', field: 'concepto', minWidth: 150, flex: 2, filter: true, floatingFilter: true },
			{
				headerName: 'Entidad Financiera', field: 'entidad_financiera.nombre', minWidth: 150, flex: 2,
				filter: true, floatingFilter: true, valueGetter: (params) => params.data.entidad_financiera?.nombre || ''
			},
			{
				headerName: 'Proyecto', field: 'proyecto.nombre', minWidth: 160, maxWidth: 160, flex: 2,
				filter: true, floatingFilter: true, valueGetter: (params) => params.data.proyecto?.nombre || '', cellClass: 'proyecto',
			},
			{ headerName: 'Observaciones', field: 'observaciones', minWidth: 150, flex: 2, filter: true, floatingFilter: true },
			{ headerName: 'Fecha Inicio', field: 'fecha_inicio', width: 90, valueFormatter: (p) => this.formatDate(p.value), minWidth: 120, },
			{ headerName: 'Fecha Fin', field: 'fecha_finalizacion', width: 90, valueFormatter: (p) => this.formatDate(p.value), minWidth: 120, },
			{ headerName: 'Cite', field: 'cite', minWidth: 100, flex: 2, filter: true, floatingFilter: true },
			{
				headerName: 'Monto',
				field: 'monto',
				width: 120,
				valueFormatter: (p) => {
					const value = Number(p.value);
					if (isNaN(value)) return '$0';
					return `$${value.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
				},
				minWidth: 120,
			},
			{ headerName: 'Nota Ejecución', field: 'nota_ejecucion', width: 100, minWidth: 100 },
			{
				headerName: 'Acciones', cellRenderer: BotonesComponent, field: 'id',
				width: 148, minWidth: 148, maxWidth: 148, pinned: 'right',
			},

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
		private boletaService: BoletaService,
		private dialog: MatDialog,
		private datePipe: DatePipe,
		private errorHandler: ErrorHandlerService,
	) { }

	ngOnInit(): void {
		this.cargarBoletas();
	}

	public ngOnDestroy(): void {
		this.boletaSubscriptor?.unsubscribe();
		if (this.gridApi) {
			this.gridApi.destroy();
		}
	}

	formatDate(dateString: string): string {
		if (!dateString) return '';
		return this.datePipe.transform(dateString, 'dd/MM/yyyy') || '';
	}

	public onGridReady(params: GridReadyEvent) {
		this.gridApi = params.api;
	}

	public cargarBoletas(): void {
		this.boletaSubscriptor = this.boletaService.getBoletas().subscribe({
			next: (response) => {
				this.dataBoletas = response;
			},
			error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al cargar las boletas.')
		});
	}



	abrirDialogoReporte(): void {
		this.dialog.open(ReporteBoletasComponent, {
			width: '800px',
			data: { boletas: this.dataBoletas }
		});
	}

	abrirModalCrear(): void {
		const dialogRef = this.dialog.open(BoletaModalComponent, {
			width: '45vw', maxWidth: '90vw', maxHeight: '90vh', disableClose: true,
			data: { boleta: null }
		});
		dialogRef.afterClosed().subscribe(result => { if (result) this.cargarBoletas(); });
	}

	abrirModalEditar(boleta: Boleta): void {
		const dialogRef = this.dialog.open(BoletaModalComponent, {
			width: '45vw', maxWidth: '90vw', maxHeight: '90vh', disableClose: true,
			data: { boleta }
		});
		dialogRef.afterClosed().subscribe(result => { if (result) this.cargarBoletas(); });
	}

	eliminarBoleta(id?: number): void {
		if (!id) return;
		Swal.fire({
			title: '¿Eliminar boleta?',
			text: 'No podrás deshacer esta acción',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Sí, eliminar'
		}).then(result => {
			if (result.isConfirmed) {
				this.boletaService.deleteBoleta(id).subscribe({
					next: () => {
						this.errorHandler.handleSuccess('Boleta eliminada correctamente');
						this.cargarBoletas();
					},
					error: (error) => {
						this.errorHandler.handleError(error, 'No se pudo eliminar la boleta');
					}
				});
			}
		});
	}

	public clikFila(event: any): void {
		const boleta = event.data;
		const action = event.event?.target?.closest('button')?.getAttribute('data-action');

		if (!action || boleta.id === undefined) return;

		if (action === 'editar') {
			this.abrirModalEditar(boleta)
		} else if (action === 'eliminar') {
			this.eliminarBoleta(boleta.id)
		}
	}

}
