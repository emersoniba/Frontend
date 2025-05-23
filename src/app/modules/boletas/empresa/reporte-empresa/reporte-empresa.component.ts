import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Empresa } from '../../../../models/empresa.interface';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-reporte-empresa',
  templateUrl: './reporte-empresa.component.html',
  imports: [MatButtonModule,MatCardModule],
  styleUrls: ['./reporte-empresa.component.css']
})
export class ReporteEmpresaComponent implements OnInit {
  empresas: Empresa[] = [];

  constructor(
    public dialogRef: MatDialogRef<ReporteEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empresas: Empresa[] }
  ) {
    this.empresas = data.empresas;
  }

  ngOnInit(): void {
  }

  generarExcel(): void {
    const titulo = [['REPORTE DE EMPRESAS']]; 
    const encabezados = [['Empresa', 'Actividad', 'NIT', 'Representante Legal', 'Contacto', 'Correo']]; 
    const datos = this.empresas.map(empresa => [
      empresa.denominacion,
      empresa.actividad?.descripcion || 'Sin actividad',
      empresa.nit,
      empresa.representante_legal,
      empresa.contacto,
      empresa.correo
    ]);
    const hojaDatos = [...titulo, [], ...encabezados, ...datos];
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(hojaDatos);
    worksheet['!cols'] = [
      { wch: 30 }, // Empresa
      { wch: 25 }, // Actividad
      { wch: 15 }, // NIT
      { wch: 30 }, // Representante Legal
      { wch: 20 }, // Contacto
      { wch: 30 }  // Correo
    ];
      worksheet['A1'].s = {
      font: {
        bold: true,
        italic: true,
        sz: 14
      },
      alignment: {
        horizontal: 'center'
      }
    };
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } } 
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Empresas': worksheet },
      SheetNames: ['Empresas']
    };

    XLSX.writeFile(workbook, 'Reporte_Empresas.xlsx', { compression: true });
    this.dialogRef.close();
  }

  generarPDF(): void {
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(18);
    doc.text('Reporte de Empresas y Proyectos', 105, yPos, { align: 'center' });
    yPos += 15;

    this.empresas.forEach((empresa, index) => {
      /*
      if (index > 0) {
        doc.addPage();
        yPos = 20;
      }
      */
      const espacioNecesario = 50 + (empresa.proyectos?.length || 0) * 7;

      if (yPos + espacioNecesario > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text(`Empresa: ${empresa.denominacion}`, 14, yPos);
      yPos += 10;

      
      doc.setFontSize(12);
      doc.text(`Actividad: ${empresa.actividad?.descripcion || 'Sin actividad'}`, 14, yPos);
      yPos += 7;
      doc.text(`NIT: ${empresa.nit}`, 14, yPos);
      yPos += 7;
      doc.text(`Representante Legal: ${empresa.representante_legal}`, 14, yPos);
      yPos += 7;
      doc.text(`Contacto: ${empresa.contacto}`, 14, yPos);
      yPos += 7;
      doc.text(`Correo: ${empresa.correo}`, 14, yPos);
      yPos += 15;
      if (empresa.proyectos && empresa.proyectos.length > 0) {
        //doc.setFont('helvetica', 'italic');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Proyectos relacionados:', 14, yPos);
        yPos += 10;

        const proyectosData = empresa.proyectos.map(proyecto => [
          proyecto.nombre,
          proyecto.descripcion,
          proyecto.fecha_creado,
          proyecto.fecha_finalizacion,
          proyecto.departamento?.nombre || 'Sin departamento'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Nombre', 'Descripción', 'Inicio', 'Finalización', 'Departamento']],
          body: proyectosData,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          styles: { fontSize: 10 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text('Boletas asociadas:', 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'italic');
        doc.text('No hay proyectos relacionados', 14, yPos);
        yPos += 10;
      }
    });

   //pie de pagina
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
    doc.save('Reporte_Empresas_Proyectos.pdf');
    this.dialogRef.close();
  }
}