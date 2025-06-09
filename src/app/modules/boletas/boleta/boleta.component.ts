import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import Swal from 'sweetalert2';

import { Boleta } from '../../../models/boleta.model';
import { BoletaService } from '../../../services/boleta.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { ReporteBoletasComponent } from './reporte-boletas/reporte-boletas.component';
import { BoletaModalComponent } from './boleta-modal/boleta-modal.component';
import { BotonesComponent } from './botones/botones.component';

import { MaterialModule } from '../../../shared/app.material';

@Component({
  standalone: true,
  selector: 'app-boleta',
  templateUrl: './boleta.component.html',
  styleUrls: ['./boleta.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, AgGridModule, MaterialModule],
  providers: [DatePipe]
})
export class BoletaComponent implements OnInit {
  boletas: Boleta[] = [];
  filteredBoletas: Boleta[] = [];
  rowData: Boleta[] = [];
  loading = false;
  private gridApi!: GridApi;

  pageSize = 10;
  pageIndex = 0;
  totalRecords = 0;
  pageSizeOptions = [3, 5, 10, 25, 100];

  columnDefs: ColDef[] = [
    {
      headerName: 'Acciones',
      cellRenderer: BotonesComponent,
      field: 'id',
      width: 133,
      minWidth: 133,
      maxWidth:133,
      pinned: 'left',
      lockPinned: true,
      suppressMovable: true,
      suppressSizeToFit: true,
    },
    {
      headerName: 'Días para Vencimiento', field: 'dias_para_vencimiento', width: 150,
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
      headerName: 'Estado', field: 'estado.nombre', width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        const icon = params.data.estado?.icono || 'info';
        const nombre = params.data.estado?.nombre || '';
        return `<span><span class="material-icons" style="font-size: 18px;">${icon}</span> ${nombre}</span>`;
      },
      valueGetter: (params) => params.data.estado?.nombre || ''
    },
    { headerName: 'Número', field: 'numero', minWidth: 150, flex: 1, filter: true, floatingFilter: true },
    { headerName: 'Tipo', field: 'tipo_boleta.nombre', minWidth: 150, flex: 2, filter: true, floatingFilter: true },
    { headerName: 'Concepto', field: 'concepto', minWidth: 150, flex: 2, filter: true, floatingFilter: true },
    {
      headerName: 'Entidad Financiera', field: 'entidad_financiera.nombre', minWidth: 150, flex: 2,
      filter: true, floatingFilter: true, valueGetter: (params) => params.data.entidad_financiera?.nombre || ''
    },
    {
      headerName: 'Proyecto', field: 'proyecto.nombre', minWidth: 160, maxWidth: 160,
      filter: true, floatingFilter: true, valueGetter: (params) => params.data.proyecto?.nombre || ''
    },
    { headerName: 'Observaciones', field: 'observaciones', minWidth: 150, flex: 2, filter: true, floatingFilter: true },
    { headerName: 'Fecha Inicio', field: 'fecha_inicio', width: 90, valueFormatter: (p) => this.formatDate(p.value) },
    { headerName: 'Fecha Fin', field: 'fecha_finalizacion', width: 90, valueFormatter: (p) => this.formatDate(p.value) },
    { headerName: 'CITE', field: 'cite', width: 30 },
    { headerName: 'Monto', field: 'monto', width: 70, valueFormatter: (p) => `$${p.value?.toLocaleString() || '0'}` },
    { headerName: 'Nota Ejecución', field: 'nota_ejecucion', width: 40 },
  ];

  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      wrapText: true,
      autoHeight: true,
      flex: 1,
      minWidth: 150,
      cellStyle: { 'white-space': 'normal', 'line-height': '1.5' }
    },
    rowClassRules: {
      'boleta-odd-row': (params: any) => params.node.rowIndex % 2 === 0,
      'boleta-even-row': (params: any) => params.node.rowIndex % 2 !== 0,
    },
    rowSelection: 'single',
    suppressHorizontalScroll: false,
    animateRows: true,
    pagination: true,
    paginationPageSize: this.pageSize,
    suppressScrollOnNewData: true,
    domLayout: 'normal',
    ensureDomOrder: true,
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return this.datePipe.transform(dateString, 'dd/MM/yyyy') || '';
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  cargarBoletas(): void {
    this.loading = true;
    this.boletaService.getBoletas().subscribe({
      next: (data) => {
        this.boletas = data;
        this.filteredBoletas = [...data];
        this.totalRecords = data.length;
        this.applyPagination();
        this.loading = false;
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'No se pudieron cargar las boletas');
        this.loading = false;
      }
    });
  }

  applyPagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.rowData = this.filteredBoletas.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPagination();
  }

  abrirDialogoReporte(): void {
    this.dialog.open(ReporteBoletasComponent, {
      width: '800px',
      data: { boletas: this.rowData }
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
