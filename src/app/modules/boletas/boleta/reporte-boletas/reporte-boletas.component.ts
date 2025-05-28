import { Component, Inject, Input } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-reporte-boletas',
  imports: [MatButtonModule, MatCardModule,MatIconModule],
  templateUrl: './reporte-boletas.component.html',
  styleUrl: './reporte-boletas.component.css'
})
export class ReporteBoletasComponent {
  @Input() boletas: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.boletas = data.boletas;
  }

  exportarExcel(): void {
    if (!this.boletas || this.boletas.length === 0) {
      alert('No hay boletas para exportar.');
      return;
    }

    // Títulos de columnas
    const encabezados = [
      'Número', 'Tipo', 'Concepto', 'Entidad Financiera', 'Proyecto',
      'Observación', 'Fecha Inicio', 'Fecha Fin', 'Cite', 'Monto',
      'Nota Ejecución', 'Estado'
    ];

    // Fila de datos
    const datos = this.boletas.map(b => [
      b.numero,
      b.tipo,
      b.concepto,
      b.entidad_financiera?.nombre || '',
      b.proyecto?.nombre || '',
      b.observaciones,
      formatFecha(b.fecha_inicio),
      formatFecha(b.fecha_finalizacion),
      b.cite,
      'Bs.'+b.monto,
      b.nota_ejecucion,
      b.estado?.nombre || ''
    ])

    // Creamos una hoja y le insertamos primero la cabecera del reporte
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      ['Reporte de Boletas'], // Fila 1: título
      [],                     // Fila 2: espacio
      encabezados,           // Fila 3: encabezados
      ...datos               // Resto: datos
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
    // Aplicar estilos (solo básicos, porque xlsx no soporta estilos avanzados)
    // Simular estilos usando merge y alto contraste
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: encabezados.length - 1 } }];
    worksheet['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' }
    };

    // Nota: XLSX (SheetJS) no soporta estilos de celda directamente en la versión comunitaria.
    // Para aplicar colores reales se necesita XLSX Pro o exportar como HTML antes de Excel.

    // Workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Boletas': worksheet },
      SheetNames: ['Boletas']
    };

    // Generar Excel
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, 'reporte_boletas.xlsx');

    function formatFecha(fechaStr: string): string {
      if (!fechaStr) return '';
      const fecha = new Date(fechaStr);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      return `${dia}/${mes}/${anio}`;
    }
  }
//fin
async exportarPDF(): Promise<void> {
  if (!this.boletas || this.boletas.length === 0) {
    alert('No hay boletas para exportar.');
    return;
  }

  const columnas = [[
    'Número', 'Tipo', 'Concepto', 'Entidad Financiera', 'Proyecto',
    'Observación', 'Fecha Inicio', 'Fecha Fin', 'Cite',
    'Monto', 'Nota Ejecución', 'Estado'
  ]];

  const datos = this.boletas.map(b => ([
    b.numero || '',
    b.tipo || '',
    b.concepto || '',
    b.entidad_financiera?.nombre || '',
    b.proyecto?.nombre || '',
    b.observaciones || '',
    formatFecha(b.fecha_inicio),
    formatFecha(b.fecha_finalizacion),
    b.cite || '',
    'Bs. ' + (b.monto || 0),
    b.nota_ejecucion || '',
    b.estado?.nombre || ''
  ]));

  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  // Cargar imágenes
  const logo1 = await this.convertImageToBase64('assets/img/logomopsv.png');

  const fechaActual = new Date();
  const fechaFormateada = `${fechaActual.getDate().toString().padStart(2, '0')}/${
    (fechaActual.getMonth() + 1).toString().padStart(2, '0')}/${fechaActual.getFullYear()}`;
  const horaFormateada = `${fechaActual.getHours().toString().padStart(2, '0')}:${fechaActual.getMinutes().toString().padStart(2, '0')}`;

  // Encabezado en cada página
  const drawHeader = () => {
  const logo1Width = 127;
  const logoHeight = 25;

    doc.addImage(logo1, 'PNG', margin, 10, logo1Width, logoHeight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fechaFormateada}`, pageWidth - margin, 22, { align: 'right' });
    doc.text(`Hora: ${horaFormateada}`, pageWidth - margin, 25, { align: 'right' });
    // Título del reporte
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
    //margin: { top: 35, left: 5, right: 10 },
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

  // Pie de página
  const pagina = "www.oep.org.bo";
  const calle = "Av. Mariscal Santa Cruz - esq. Calle Oruro, Edif. Centro de Comunicaciones La Paz, 5to piso.";
  const telefono = "Tel: (591-2) 2195299 - 2155400";

  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

 for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  const footerY = 190;
  doc.line(10, footerY, 287, footerY); // línea horizontal
  doc.text(pagina, 148, footerY + 5, { align: 'center' });
  doc.text(calle, 148, footerY + 10, { align: 'center' });
  doc.text(telefono, 148, footerY + 15, { align: 'center' });
}


  doc.save('reporte_boletas.pdf');

  function formatFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
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
}
