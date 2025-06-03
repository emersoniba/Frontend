import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BoletaService } from '../../../services/boleta.service';
import { Boleta } from '../../../models/boleta.model';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { BoletaModalComponent } from './boleta-modal/boleta-modal.component';
import Swal from 'sweetalert2';
import { PdfViewerDialogComponent } from './pdf-viewer-dialog/pdf-viewer-dialog.component';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { ReporteBoletasComponent } from './reporte-boletas/reporte-boletas.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    FormsModule,
    AgGridModule,
  ],
  selector: 'app-boleta',
  templateUrl: './boleta.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./boleta.component.css'],
  providers: [DatePipe]
})
export class BoletaComponent implements OnInit {
  boletas: Boleta[] = [];
  filteredBoletas: Boleta[] = [];
  loading = false;
  private gridApi!: GridApi;

  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [3, 5, 10, 25, 100];
  totalRecords = 0;

  // Configuración de columnas - ahora con la columna Acciones primero y fija
  columnDefs: ColDef[] = [
    {
      headerName: 'Acciones',
      cellRenderer: (params: ICellRendererParams) => {
        return `
                <button class="edit-btn" title="Editar">✏️</button>
                <button class="delete-btn" title="Eliminar">🗑️</button>
            `;
      },
      //width: 120,
      width: 140, // Suficiente para 2 botones
      minWidth: 120,
      maxWidth: 160,
      pinned: 'left',
      lockPinned: true,
      suppressMovable: true,
      // cellStyle: { 'white-space': 'nowrap' },
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap'
      },
      suppressSizeToFit: true, // No se ajusta al tamaño
    },
    //dias de venciminto
    {
      headerName: 'Días para Vencimiento',
      field: 'dias_para_vencimiento',
      width: 150,
      cellRenderer: (params: ICellRendererParams) => {
        if (params.value === undefined || params.value === null) return '-';

        const dias = params.value;
        let texto = '';
        let clase = '';
        if (dias > 15) {
          texto = `Faltan ${dias} días hábiles`;
          clase = 'dias-verde';
        } else if (dias > 3) {
          texto = `Faltan ${dias} días hábiles`;
          clase = 'dias-amarillo';
        } else if (dias >= 0) {
          texto = `Faltan ${dias} días hábiles`;
          clase = 'dias-rojo';
        } else {
          texto = `Venció hace ${Math.abs(dias)} días hábiles`;
          clase = 'dias-vencido';
        }

        return `<span class="dias-restantes ${clase}">${texto}</span>`;
      }
    },
    //inicio
     
    //fin
    {
      headerName: 'Estado',
      field: 'estado.nombre',
      width: 150,
      cellStyle: { 'white-space': 'normal', 'line-height': '1.5' },
      cellRenderer: (params: ICellRendererParams) => {
        const icon = params.data.estado?.icono || 'info';
        const nombre = params.data.estado?.nombre || '';

        const container = document.createElement('div');
        container.innerHTML = `
          <span class="material-icons" style="font-size: 18px;">${icon}</span>
            ${nombre}
          </span>
        `;
        return container;
      },
      valueGetter: (params) => params.data.estado?.nombre || ''
    },
    {
      headerName: 'Número',
      field: 'numero',
      width: 300,
      minWidth: 150, // Ancho mínimo
      flex: 1, // Puede crecer
      autoHeight: true,
      wrapText: true,
      cellStyle: { 'white-space': 'normal' },
      filter: true,
      floatingFilter: true,
      filterParams: {
        suppressAndOrCondition: true,
        caseSensitive: false,
        debounceMs: 500
      }
    },
    {
      headerName: 'Tipo',
      field: 'tipo',
      width: 200,
      minWidth: 200, // Ancho mínimo mayor para contenido largo
      flex: 2, // Más flexible que otras
      autoHeight: true,
      wrapText: true,
      cellStyle: { 'white-space': 'normal' },
      filter: true,
      floatingFilter: true,
    },
    {
      headerName: 'Concepto',
      field: 'concepto',
      //width: 500,
      width: 300,
      minWidth: 300, // Ancho mínimo mayor para contenido largo
      flex: 2,
      autoHeight: true,
      wrapText: true,
      cellStyle: {
        'white-space': 'normal',
        'line-height': '1.5'
      },
      filter: true,
      floatingFilter: true,
    },
    {
      headerName: 'Entidad Financiera',
      field: 'entidad_financiera.nombre',
      width: 300,
      autoHeight: true,
      wrapText: true,
      cellStyle: { 'white-space': 'normal', 'line-height': '1.5' },
      filter: true,
      floatingFilter: true,
      valueGetter: (params) => params.data.entidad_financiera?.nombre || ''
    },
    {
      headerName: 'Proyecto',
      field: 'proyecto.nombre',
      autoHeight: true,
      //width: 300,
      minWidth: 600,
      maxWidth: 600,
      wrapText: true,
      cellStyle: { 'white-space': 'normal', 'line-height': '1.5' },
      filter: true,
      floatingFilter: true,
      valueGetter: (params) => params.data.proyecto?.nombre || ''
    },
    {
      headerName: 'Archivo',
      field: 'archivo',
      width: 90,
      cellRenderer: (params: ICellRendererParams) => {
        return params.value
          ? `<button class="pdf-btn" title="Ver PDF">
              <span class="material-icons pdf-icon" style="color: #e53935;">picture_as_pdf</span>
              <span class="pdf-badge">Ver</span>
            </button>`
          : '<span class="no-file">-</span>';
      }
    },
    {
      headerName: 'Observaciones',
      field: 'observaciones',
      //width: 300,
      width: 300,
      minWidth: 300, // Ancho mínimo mayor para contenido largo
      flex: 2,
      filter: true,
      cellStyle: { 'white-space': 'normal', 'line-height': '1.5' },
      floatingFilter: true
    },
    {
      headerName: 'Fecha Inicio',
      field: 'fecha_inicio',
      width: 120,
      valueFormatter: (params) => this.formatDate(params.value)
    },
    {
      headerName: 'Fecha Fin',
      field: 'fecha_finalizacion',
      width: 120,
      valueFormatter: (params) => this.formatDate(params.value)
    },
    {
      headerName: 'CITE',
      field: 'cite',
      width: 100
    },
    {
      headerName: 'Monto',
      field: 'monto',
      width: 120,
      valueFormatter: (params) => `$${params.value?.toLocaleString() || '0'}`
    },
    {
      headerName: 'Nota Ejecución',
      field: 'nota_ejecucion',
      width: 150
    },

  ];

  // Configuración del grid
  gridOptions: GridOptions = {
    rowClassRules: {
      'boleta-odd-row': (params: any) => params.node.rowIndex % 2 === 0,
      'boleta-even-row': (params: any) => params.node.rowIndex % 2 !== 0,
    },
    rowSelection: 'single',
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      wrapText: true,
      autoHeight: true,
      flex: 1, 
      minWidth: 150, 
    },
    suppressHorizontalScroll: false,
    alwaysShowHorizontalScroll: true,
    domLayout: 'normal', 
    suppressScrollOnNewData: true,
    animateRows: true,
    pagination: true,
    paginationPageSize: 10,
    ensureDomOrder: true,
    suppressColumnVirtualisation: true, 
  };

  rowData: Boleta[] = [];

  constructor(
    private boletaService: BoletaService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.cargarBoletas();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return this.datePipe.transform(dateString, 'dd/MM/yyyy') || '';
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    // Verifica los datos recibidos
    params.api.addEventListener('modelUpdated', () => {
      const rowData: Boleta[] = [];
      params.api.forEachNode(node => rowData.push(node.data));
      console.log('Datos de la grilla:', rowData);
    });
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
      error: (err) => {
        console.error('Error cargando boletas:', err);
        this.loading = false;
      }
    });
  }

  applyPagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.rowData = this.filteredBoletas.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPagination();
  }

  onCellClicked(event: any) {
    const boleta = event.data;
    const target = event.event?.target as HTMLElement;
    if (!target) return;

    if (target.closest('.pdf-btn')) {
      if (boleta.archivo) {
        this.verPDF(boleta.archivo);
      }
    } else if (target.closest('.edit-btn')) {
      this.abrirModalEditar(boleta);
    } else if (target.closest('.delete-btn')) {
      this.eliminarBoleta(boleta.id);
    }
  }

  verPDF(archivoUrl: string) {
    this.dialog.open(PdfViewerDialogComponent, {
      width: '80%',
      data: { pdfUrl: archivoUrl }
    });
  }

  abrirDialogoReporte(): void {
    this.dialog.open(ReporteBoletasComponent, {
      width: '600px',
      data: { boletas: this.rowData }
    });
  }

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(BoletaModalComponent, {
      width: '50vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { boleta: null }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarBoletas();
    });
  }

  abrirModalEditar(boleta: Boleta): void {
    const dialogRef = this.dialog.open(BoletaModalComponent, {
      width: '50vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { boleta }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarBoletas();
    });
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.boletaService.deleteBoleta(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La boleta ha sido eliminada.', 'success');
            this.cargarBoletas();
          },
          error: (err) => {
            console.error('Error eliminando boleta:', err);
            Swal.fire('Error', 'Hubo un problema al eliminar la boleta.', 'error');
          }
        });
      }
    });
  }


}