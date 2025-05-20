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
import { ModuleRegistry } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { DatePipe } from '@angular/common';

ModuleRegistry.registerModules([
  MasterDetailModule,
  RowGroupingModule
]);
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
    BoletaModalComponent
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
  pageSizeOptions = [3,5, 10, 25, 100];
  totalRecords = 0;
  
  // Configuración de columnas principales
  columnDefs: ColDef[] = [
    {
      headerName: 'Número',
      field: 'numero',
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: { suppressCount: true },
      width: 100,
      autoHeight: true,
      wrapText: true,  
      cellStyle: { 'white-space': 'normal' },
      filter:true,
      floatingFilter:true,
      filterParams: {
        suppressAndOrCondition: true,
        caseSensitive: false,
        debounceMs: 500
      }
    },      
    { 
      headerName: 'Tipo', 
      field: 'tipo',
      width: 100,
      autoHeight: true,
      wrapText: true,
      cellStyle: { 'white-space': 'normal' },
        filter:true,
        floatingFilter:true,
     // filter: 'agTextColumnFilter'
    },
    { 
      headerName: 'Concepto', 
      field: 'concepto', 
      width: 130,
      autoHeight: true,
      wrapText: true,
      cellStyle: { 
        'white-space': 'normal',
        'line-height': '1.5' 
      },
      //filter: 'agTextColumnFilter'
      filter:true,
      floatingFilter:true,
    },
    { 
      headerName: 'Entidad Financiera', 
      field: 'entidad_financiera.nombre', 
      width: 130,
      autoHeight: true,
      wrapText: true,
      cellStyle: { 'white-space': 'normal' },
      //filter: 'agTextColumnFilter'
      filter:true,
      floatingFilter:true,
    },
    { 
      headerName: 'Proyecto', 
      field: 'proyecto.nombre',
      autoHeight: true,
      width: 100,
      wrapText: true,
      cellStyle: { 'white-space': 'normal' },
      //ilter: 'agTextColumnFilter'
      filter:true,
      floatingFilter:true,
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
    { headerName: 'observaciones', field:'observaciones',width:120,filter:true,
      floatingFilter:true,},
    {
      headerName: 'Acciones',
      cellRenderer: (params: ICellRendererParams) => {
         return `
        <button class="edit-btn btn btn-warning btn-sm" title="Editar">✏️</button>
        <button class="delete-btn btn btn-danger btn-sm" title="Eliminar">🗑️</button>
        `;
      },
      width: 100
    }
  ];

  // Configuración del grid de detalle
  detailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { 
          headerName: 'Fecha Inicio', 
          field: 'fecha_inicio',
          valueFormatter: (params: any) => this.formatDate(params.value)
        },
        { 
          headerName: 'Fecha Fin', 
          field: 'fecha_finalizacion',
          valueFormatter: (params: any) => this.formatDate(params.value)
        },
        { headerName: 'CITE', field: 'cite',width: 100 },
        { headerName: 'Monto', field: 'monto', valueFormatter: (params: any)  => `$${params.value.toLocaleString()}`,width:10},
        { headerName: 'Nota Ejecución', field: 'nota_ejecucion' },
        {
          headerName: 'Estado',
          field: 'estado.nombre',
          cellRenderer: (params: ICellRendererParams) => {
           // const color = params.data.estado?.color || '#ccc';
            const icon = params.data.estado?.icono || 'info';
            const nombre = params.value || '';

            const container = document.createElement('div');
            container.innerHTML = `
              <span class="material-icons" style="font-size: 18px;">${icon}</span>
                ${nombre}
              </span>
            `;
            return container;
          }
        },
      ],
      defaultColDef: {
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: true,
      filter: true,
      autoHeight: true,
      wrapText: true,
      cellStyle: { 'white-space': 'normal' }
      }
      
    },
     domLayout: 'autoHeight',
      suppressScrollOnNewData: true,
      headerHeight: 40,
      rowHeight: 40,

    getDetailRowData: (params: any) => {
      params.successCallback([params.data]);
    }
  };

  // Configuración principal del grid
  gridOptions: GridOptions = {
    masterDetail: true,
    detailRowHeight: 150,
    
    rowClassRules: {
      'boleta-odd-row': (params: any) => params.node.rowIndex % 2 === 0,
      'boleta-even-row': (params: any) => params.node.rowIndex % 2 !== 0,
    },
    
    getRowStyle: (params) => {
      if (params.node.expanded) {
        return { 'background-color': '#f0f7ff' }; 
      }
      return undefined;
    },
  
    detailCellRendererParams: this.detailCellRendererParams,
    rowSelection: 'single',
    onFirstDataRendered: (params) => {
      params.api.forEachNode((node) => {
        node.setExpanded(node.rowIndex === 0);
      });
    },
    onRowClicked: (event) => {
      event.api.forEachNode(node => {
        if (node.id !== event.node.id) {
          node.setSelected(false);
        }
      });
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      autoHeight: true,     
      wrapText: true,       
      cellStyle: { 
        'white-space': 'normal', 
        'line-height': '1.5'    
      },
      filterParams: {
        suppressAndOrCondition: true,
        caseSensitive: false,
        debounceMs: 500
      }
    },
    suppressCellFocus: true, 
    animateRows: true,
    pagination: true,
    paginationPageSize: 10,
    domLayout: 'autoHeight'
  };

  rowData: Boleta[] = [];

  constructor(
    private boletaService: BoletaService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

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

  // Método para aplicar paginación
  applyPagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.rowData = this.filteredBoletas.slice(startIndex, endIndex);
    
    // Si estás usando el paginador de AG-Grid
    if (this.gridApi) {
     // this.gridApi.setRowData(this.rowData);
    }
  }

  // Manejar cambio de página
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyPagination();
  }


  onRowClicked(event: any) {
    const node = event.node;
    if (node) {
      node.setExpanded(!node.expanded);
    }
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

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(BoletaModalComponent, {
      width: '800px',
      panelClass: 'custom-mat-dialog',
      data: { boleta: null }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarBoletas();
    });
  }

  abrirModalEditar(boleta: Boleta): void {
    const dialogRef = this.dialog.open(BoletaModalComponent, {
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