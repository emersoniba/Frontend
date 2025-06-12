import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/app.material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';


@Component({
  standalone: true,
  selector: 'app-reporte-boletas',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MaterialModule,
   // DatePipe,
  ],
  templateUrl: './reporte-boletas.component.html',
  providers: [
    provideNativeDateAdapter()
  ],
  styleUrl: './reporte-boletas.component.css'
})


export class ReporteBoletasComponent implements OnDestroy {
  @Input() boletas: any[] = [];
  filterForm: FormGroup;
  tipos: string[] = [];
  entidades: string[] = [];
  estados: string[] = [];
  filteredBoletas: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,

    public dialogRef: MatDialogRef<ReporteBoletasComponent>
  ) {
    this.boletas = data.boletas;
    this.filteredBoletas = [...this.boletas];
    this.tipos = [...new Set(this.boletas.map(b => b.tipo_boleta?.nombre))].filter(t => t);
    this.entidades = [...new Set(this.boletas.map(b => b.entidad_financiera?.nombre))].filter(e => e);
    this.estados = [...new Set(this.boletas.map(b => b.estado?.nombre))].filter(e => e);

    this.filterForm = this.fb.group({
      fechaInicio: [null],
      fechaFin: [null],
      tiposSeleccionados: [[]],
      entidadesSeleccionadas: [[]],
      estadosSeleccionados: [[]],
      usarFiltros: [false]
    });

    this.filterForm.get('usarFiltros')?.valueChanges.subscribe(usarFiltros => {
      if (usarFiltros) {
        this.filterForm.get('fechaInicio')?.disable();
        this.filterForm.get('fechaFin')?.disable();
      } else {
        this.filterForm.get('fechaInicio')?.enable();
        this.filterForm.get('fechaFin')?.enable();
        this.filterForm.get('tiposSeleccionados')?.setValue([]);
        this.filterForm.get('entidadesSeleccionadas')?.setValue([]);
        this.filterForm.get('estadosSeleccionados')?.setValue([]);
      }
      this.aplicarFiltros();
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }
  ngOnDestroy(): void {

    this.dialogRef.close();

  }
  aplicarFiltros(): void {
    let boletasFiltradas = [...this.boletas];

    if (!this.filterForm.get('usarFiltros')?.value) {
      const fechaInicio = this.filterForm.get('fechaInicio')?.value;
      const fechaFin = this.filterForm.get('fechaFin')?.value;

      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        boletasFiltradas = boletasFiltradas.filter(b => {
          const fechaBoleta = this.parseFecha(b.fecha_inicio);
          return fechaBoleta >= inicio;
        });
      }

      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        boletasFiltradas = boletasFiltradas.filter(b => {
          const fechaBoleta = this.parseFecha(b.fecha_finalizacion);
          return fechaBoleta <= fin;
        });
      }
    } else {
      const tipos = this.filterForm.get('tiposSeleccionados')?.value || [];
      const entidades = this.filterForm.get('entidadesSeleccionadas')?.value || [];
      const estados = this.filterForm.get('estadosSeleccionados')?.value || [];

      if (tipos.length > 0) {
        boletasFiltradas = boletasFiltradas.filter(b =>
          tipos.includes(b.tipo_boleta?.nombre)
        );
      }

      if (entidades.length > 0) {
        boletasFiltradas = boletasFiltradas.filter(b =>
          entidades.includes(b.entidad_financiera?.nombre)
        );
      }

      if (estados.length > 0) {
        boletasFiltradas = boletasFiltradas.filter(b =>
          estados.includes(b.estado?.nombre)
        );
      }
    }

    this.filteredBoletas = boletasFiltradas;
  }

  exportarExcel(): void {
    if (!this.boletas || this.boletas.length === 0) {
      alert('No hay boletas para exportar.');
      return;
    }

    const encabezados = [
      'Número', 'Tipo', 'Concepto', 'Entidad Financiera', 'Proyecto',
      'Observación', 'Fecha Inicio', 'Fecha Fin', 'Cite', 'Monto',
      'Nota Ejecución', 'Estado'
    ];

    const datos = this.filteredBoletas.map(b => [
      b.numero,
      b.tipo_boleta?.nombre || '',
      b.concepto,
      b.entidad_financiera?.nombre || '',
      b.proyecto?.nombre || '',
      b.observaciones,
      this.formatFecha(b.fecha_inicio),
      this.formatFecha(b.fecha_finalizacion),
      b.cite,
      'Bs.' + b.monto,
      b.nota_ejecucion,
      b.estado?.nombre || ''
    ])

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      ['Reporte de Boletas'],
      [],
      encabezados,
      ...datos
    ]);
    worksheet['!cols'] = [
      { wch: 12 }, // Número
      { wch: 10 }, // Tipo
      { wch: 25 }, // Concepto
      { wch: 20 }, // Entidad Financiera
      { wch: 20 }, // Proyecto
      { wch: 30 }, // Observación
      { wch: 15 }, // Fecha Inicio
      { wch: 15 }, // Fecha Fin
      { wch: 25 }, // Cite
      { wch: 12 }, // Monto
      { wch: 20 }, // Nota Ejecución
      { wch: 15 }  // Estado
    ];

    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: encabezados.length - 1 } }];

    worksheet['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' }

    };
    // Workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Boletas': worksheet },
      SheetNames: ['Boletas']
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, 'reporte_boletas.xlsx');
  }

  async exportarPDF(): Promise<void> {
    if (!this.filteredBoletas || this.filteredBoletas.length === 0) {
      alert('No hay boletas para exportar.');
      return;
    }

    const columnas = [[
      'Número', 'Tipo', 'Concepto', 'Entidad Financiera', 'Proyecto',
      'Observación', 'Fecha Inicio', 'Fecha Fin', 'Cite',
      'Monto', 'Nota Ejecución', 'Estado'
    ]];

    const datos = this.filteredBoletas.map(b => ([
      b.numero || '',
      b.tipo_boleta?.nombre || '',
      b.concepto || '',
      b.entidad_financiera?.nombre || '',
      b.proyecto?.nombre || '',
      b.observaciones || '',
      this.formatFecha(b.fecha_inicio),
      this.formatFecha(b.fecha_finalizacion),
      b.cite || '',
      'Bs. ' + (b.monto || 0),
      b.nota_ejecucion || '',
      b.estado?.nombre || ''
    ]));

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    const logo1 = await this.convertImageToBase64('assets/img/logomopsv.png');

    const fechaActual = new Date();
    const fechaFormateada = `${fechaActual.getDate().toString().padStart(2, '0')}/${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}/${fechaActual.getFullYear()}`;
    const horaFormateada = `${fechaActual.getHours().toString().padStart(2, '0')}:${fechaActual.getMinutes().toString().padStart(2, '0')}`;

    const drawHeader = () => {
      const logo1Width = 127;
      const logoHeight = 25;

      doc.addImage(logo1, 'PNG', margin, 10, logo1Width, logoHeight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaFormateada}`, pageWidth - margin, 22, { align: 'right' });
      doc.text(`Hora: ${horaFormateada}`, pageWidth - margin, 25, { align: 'right' });
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE BOLETAS', pageWidth / 2, 32, { align: 'center' });
    };

    drawHeader();

    autoTable(doc, {
      startY: 35,
      head: columnas,
      body: datos,
      theme: 'grid',
      margin: { top: 35, left: 5, right: 10, bottom: 23 },
      styles: {
        fontSize: 7,
        cellPadding: 1,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [101, 110, 113],
        textColor: 255,
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 15 },  // Número
        1: { cellWidth: 20 },  // Tipo
        2: { cellWidth: 40 },  // Concepto
        3: { cellWidth: 25 },  // Entidad Financiera
        4: { cellWidth: 30 },  // Proyecto
        5: { cellWidth: 35 },  // Observación
        6: { cellWidth: 20 },  // Fecha Inicio
        7: { cellWidth: 20 },  // Fecha Fin
        8: { cellWidth: 15 },  // Cite
        9: { cellWidth: 20 },  // Monto
        10: { cellWidth: 30 }, // Nota Ejecución
        11: { cellWidth: 20 }  // Estado
      },
      didDrawPage: () => {
        drawHeader();
      }
    });

    const pagina = "www.oep.org.bo";
    const calle = "Av. Mariscal Santa Cruz - esq. Calle Oruro, Edif. Centro de Comunicaciones La Paz, 5to piso.";
    const telefono = "Tel: (591-2) 2195299 - 2155400";

    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = 190;
      doc.line(10, footerY, 287, footerY);
      doc.text(pagina, 148, footerY + 5, { align: 'center' });
      doc.text(calle, 148, footerY + 10, { align: 'center' });
      doc.text(telefono, 148, footerY + 15, { align: 'center' });
    }
    doc.save('reporte_boletas.pdf');
  }

  convertImageToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = error => reject(error);
    });
  }

  formatFecha(fecha: any): string {
    if (!fecha) return '';

    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES');
    } catch {
      return '';
    }
  }

  private parseFecha(fechaStr: string | Date): Date {
    if (!fechaStr) return new Date(0);
    if (fechaStr instanceof Date) {
      return new Date(fechaStr.getTime());
    }
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      const partes = fechaStr.split(/[-/]/);
      if (partes.length === 3) {
        return new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
      }
    }

    return fecha;
  }
}