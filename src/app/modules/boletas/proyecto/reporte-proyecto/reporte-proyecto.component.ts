import { Component, Inject, Input } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card'; // Importación añadida
import { CommonModule } from '@angular/common';

@Component({
  //standalone: true,
  selector: 'app-reporte-proyecto',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './reporte-proyecto.component.html',
  styleUrl: './reporte-proyecto.component.css'
})
export class ReporteProyectoComponent {
  @Input() proyectos: any[] = [];
  boletas: any[] = [];
  //proyecto: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.proyectos = data.proyectos;
    //this.boletas = data.boletas || [];
    this.proyectos.forEach((proyecto: any) => {
      proyecto.boletas = data.boletas?.filter((b: any) => b.proyecto_id === proyecto.id) || [];
    });
  }
  exportarExcel(): void {
    if (!this.proyectos || this.proyectos.length === 0) {
      alert('No hay proyectos para exportar.');
      return;
    }
    const encabezados = [
      'Nombre', 'Descripcion', 'Entidad', 'Departamento', 'Fecha creacion',
      'Fecha finalizacion'
    ];
    const datos = this.proyectos.map(b => [
      b.nombre,
      b.descripcion,
      b.entidad?.denominacion || '',
      b.departamento?.nombre || '',
      formatFecha(b.fecha_creado),
      formatFecha(b.fecha_finalizacion)
    ])
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      ['Reporte de proyectos'],
      [],
      encabezados,
      ...datos
    ]);
    worksheet['!cols'] = [
      { wch: 30 }, // nombre
      { wch: 30 }, // descripcion
      { wch: 25 }, // entidad
      { wch: 20 }, // departamento
      { wch: 20 }, // fechini
      { wch: 30 }, // fechfin
    ];
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: encabezados.length - 1 } }];
    worksheet['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' }
    };
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Proyectos': worksheet },
      SheetNames: ['Proyectos']
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(blob, 'reporte_proyectos.xlsx');

    function formatFecha(fechaStr: string): string {
      if (!fechaStr) return '';
      const fecha = new Date(fechaStr);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      return `${dia}/${mes}/${anio}`;
    }
  }
  //
  async exportarPdf(): Promise<void> {
  if (!this.proyectos || this.proyectos.length === 0) {
    Swal.fire('Error', 'No hay proyectos para exportar.', 'error');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Carga de imágenes BASE64 (esperar que terminen)
  const logo1 = await this.convertImageToBase64('assets/img/logomopsv.png');

  const fechaActual = new Date();
  const fechaFormateada = `${fechaActual.getDate().toString().padStart(2, '0')}/${
  (fechaActual.getMonth() + 1).toString().padStart(2, '0')}/${
  fechaActual.getFullYear()}`;
  const fecha = new Date();
  const horaFormateada = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;

const drawHeader = () => {
  const logo1Width = 120;
  const logo2Width = 35;
  const logoHeight = 20;
  const spacing = 3;

  doc.addImage(logo1, 'PNG', margin, 10, logo1Width, logoHeight);
  
  const textoX = margin + logo1Width + logo2Width + spacing * 3;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${fechaFormateada}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Hora: ${horaFormateada}`, pageWidth - margin, 33, { align: 'right' });
};


drawHeader();
let yPos = 45; // Asegura espacio suficiente para los logos y texto
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE PROYECTOS CON BOLETAS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  for (const proyecto of this.proyectos) {
    const espacioNecesario = 50 + (proyecto.boletas?.length || 0) * 7;
    if (yPos + espacioNecesario > 270) {
    doc.addPage();
    drawHeader();
    yPos = 45;
  }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const textoProyecto = doc.splitTextToSize(`Proyecto: ${proyecto.nombre}`, 180);
    doc.text(textoProyecto, margin, yPos);
    yPos += textoProyecto.length * 5.2; // Ajusta el espacio en función del número de líneas


    doc.setFont('helvetica', 'normal');
  const textodescripcion = doc.splitTextToSize(`Descripción: ${proyecto.descripcion}`, 180);
    doc.text(textodescripcion, margin, yPos);
    yPos += textodescripcion.length * 5.2;

    doc.text(`Entidad: ${proyecto.entidad?.denominacion || 'Sin entidad'}`, margin, yPos); yPos += 7;
    doc.text(`Departamento: ${proyecto.departamento?.nombre || 'Sin departamento'}`, margin, yPos); yPos += 7;

    const fechaCreacion = proyecto.fecha_creado ? this.formatFecha(proyecto.fecha_creado) : 'Sin fecha';
    const fechaFinalizacion = proyecto.fecha_finalizacion ? this.formatFecha(proyecto.fecha_finalizacion) : 'Sin fecha';
    doc.text(`Fechas: Creación ${fechaCreacion} - Finalización ${fechaFinalizacion}`, margin, yPos); yPos += 10;

    if (proyecto.boletas && proyecto.boletas.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Boletas asociadas:', margin, yPos);
      yPos += 7;
      const boletasData = proyecto.boletas.map((boleta: any) => [
        boleta.numero || 'N/A',
        boleta.tipo || 'N/A',
        boleta.concepto || 'Sin concepto',
        'Bs. ' + (boleta.monto || 0)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Número', 'Tipo', 'Concepto', 'Monto']],
        body: boletasData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [101, 110, 113], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 20 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 25, halign: 'right' }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No hay boletas asociadas a este proyecto', margin, yPos);
      yPos += 10;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;
  }

  // Pie de página
  const pagina = "www.oep.org.bo";
  const calle = "Av. Mariscal Santa Cruz - esq. Calle Oruro, Edif. Centro de Comunicaciones La Paz, 5to piso.";
  const telefono = "Tel: (591-2) 2195299 - 2155400";

  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.line(10, 282, 200, 282);
    doc.text(pagina, 105, 285, { align: 'center' });
    doc.text(calle, 105, 290, { align: 'center' });
    doc.text(telefono, 105, 295, { align: 'center' });
  }

  doc.save('reporte_proyectos_con_boletas.pdf');
}

 //
  private formatFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
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
