import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import autoTable from 'jspdf-autotable';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MaterialModule } from '../../../../shared/app.material';


@Component({
  selector: 'app-reporte-proyecto',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MaterialModule
  ],
  templateUrl: './reporte-proyecto.component.html',
  styleUrl: './reporte-proyecto.component.css',
  providers: [provideNativeDateAdapter(), DatePipe]
})
export class ReporteProyectoComponent implements OnInit, OnDestroy {
  @Input() proyectos: any[] = [];
  boletas: any[] = [];
  filteredProyectos: any[] = [];
  filterForm: FormGroup;
  entidades: string[] = [];
  departamentos: string[] = [];
  entidadesFiltradasArray: string[] = [];
  departamentosFiltradosArray: string[] = [];
  entidadesFilterCtrl = new FormControl<string>('');
  departamentosFilterCtrl = new FormControl<string>('');
  entidadesFiltradas: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  departamentosFiltrados: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  protected _onDestroy = new Subject<void>();

  constructor(
  
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ReporteProyectoComponent>
    
  ) {
    this.proyectos = data.proyectos.map((proyecto: any) => {
      return {
        ...proyecto,
        boletas: data.boletas.filter((boleta: any) => boleta.proyecto?.id === proyecto.id)
      };
    });
    this.boletas = data.boletas || [];
    this.entidades = [...new Set(this.proyectos.map(p => p.entidad?.denominacion).filter(e => e))];
    this.departamentos = [...new Set(this.proyectos.map(p => p.departamento?.nombre).filter(d => d))];
    this.filteredProyectos = [...this.proyectos];
    this.filterForm = this.fb.group({
      fechaInicio: [null],
      fechaFin: [null],
      entidadesSeleccionadas: [[]],
      departamentosSeleccionados: [[]],
      usarFiltrosEspeciales: [false]
    });
    this.filterForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  ngOnInit(): void {
    this.entidadesFiltradas.next(this.entidades.slice());
    this.departamentosFiltrados.next(this.departamentos.slice());
    this.entidadesFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtrarEntidades();
      });

    this.departamentosFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filtrarDepartamentos();
      });
    this.entidadesFiltradas.subscribe(data => {
      this.entidadesFiltradasArray = data;
    });
    this.departamentosFiltrados.subscribe(data => {
      this.departamentosFiltradosArray = data;
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  filtrarEntidades(): void {
    if (!this.entidades) return;

    let search = this.entidadesFilterCtrl.value;
    if (!search) {
      this.entidadesFiltradas.next(this.entidades.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.entidadesFiltradas.next(
      this.entidades.filter(entidad =>
        entidad.toLowerCase().includes(search as string))
    );
  }

  filtrarDepartamentos(): void {
    if (!this.departamentos) return;
    let search = this.departamentosFilterCtrl.value;
    if (!search) {
      this.departamentosFiltrados.next(this.departamentos.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.departamentosFiltrados.next(
      this.departamentos.filter(depto =>
        depto.toLowerCase().includes(search as string))
    );
  }

  aplicarFiltros(): void {
    let proyectosFiltrados = [...this.proyectos];
    if (!this.filterForm.get('usarFiltrosEspeciales')?.value) {
      const fechaInicio = this.filterForm.get('fechaInicio')?.value;
      const fechaFin = this.filterForm.get('fechaFin')?.value;

      if (fechaInicio || fechaFin) {
        proyectosFiltrados = proyectosFiltrados.filter(p => {
          const fechaCreacion = this.parseFecha(p.fecha_creado);
          const fechaFinalizacion = this.parseFecha(p.fecha_finalizacion);
          const cumpleInicio = fechaInicio
            ? (fechaCreacion !== null && fechaCreacion >= new Date(fechaInicio.setHours(0, 0, 0, 0)))
            : true;
          const cumpleFin = fechaFin
            ? (fechaFinalizacion
              ? fechaFinalizacion <= new Date(fechaFin.setHours(23, 59, 59, 999))
              : (fechaCreacion !== null && fechaCreacion <= new Date(fechaFin.setHours(23, 59, 59, 999))))
            : true;
          return cumpleInicio && cumpleFin;
        });
      }
    } else {
      const entidades = this.filterForm.get('entidadesSeleccionadas')?.value || [];
      const departamentos = this.filterForm.get('departamentosSeleccionados')?.value || [];
      if (entidades.length > 0) {
        proyectosFiltrados = proyectosFiltrados.filter(p =>
          entidades.includes(p.entidad?.denominacion)
        );
      }
      if (departamentos.length > 0) {
        proyectosFiltrados = proyectosFiltrados.filter(p =>
          departamentos.includes(p.departamento?.nombre)
        );
      }
    }
    this.filteredProyectos = proyectosFiltrados;
  }

  private parseFecha(fecha: any): Date | null {
    if (!fecha) return null;
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
      return new Date(fecha.getTime());
    }
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(fecha + 'T00:00:00');
    }
    if (typeof fecha === 'string' && fecha.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dd, mm, yyyy] = fecha.split('/');
      return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    }
    const parsedDate = new Date(fecha);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  exportarExcel(): void {
    if (!this.proyectos || this.proyectos.length === 0) {
      alert('No hay proyectos para exportar.');
      return;
    }
    const encabezados = [
      'Nombre', 'Descripcion', 'Entidad', 'Departamento', 'Fecha creacion',
      'Fecha finalizacion', 'N° Boletas'
    ];
    const datos = this.filteredProyectos.map(b => [
      b.nombre,
      b.descripcion,
      b.entidad?.denominacion || '',
      b.departamento?.nombre || '',
      this.formatFecha(b.fecha_creado),
      this.formatFecha(b.fecha_finalizacion),
      b.boletas?.length || 0
    ]);
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
      { wch: 20 }, // fechfin
      { wch: 10 }  // n° boletas
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
  }

  async exportarPdf(): Promise<void> {
    if (!this.proyectos || this.proyectos.length === 0) {
      Swal.fire('Error', 'No hay proyectos para exportar.', 'error');
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const logo1 = await this.convertImageToBase64('assets/img/logomopsv.png');
    const fechaActual = new Date();
    const fechaFormateada = `${fechaActual.getDate().toString().padStart(2, '0')}/${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}/${fechaActual.getFullYear()}`;
    const fecha = new Date();
    const horaFormateada = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    const drawHeader = () => {
      const logo1Width = 120;
      const logoHeight = 20;
      doc.addImage(logo1, 'PNG', margin, 10, logo1Width, logoHeight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaFormateada}`, pageWidth - margin, 30, { align: 'right' });
      doc.text(`Hora: ${horaFormateada}`, pageWidth - margin, 33, { align: 'right' });
    };

    drawHeader();
    let yPos = 45;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE PROYECTOS CON BOLETAS', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    for (const proyecto of this.filteredProyectos) {
      const espacioNecesario = 50 + (proyecto.boletas?.length || 0) * 7;
      if (yPos + espacioNecesario > 270) {
        doc.addPage();
        drawHeader();
        yPos = 45;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Proyecto: ${proyecto.nombre}`, margin, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      const textodescripcion = doc.splitTextToSize(`Descripción: ${proyecto.descripcion}`, 180);
      doc.text(textodescripcion, margin, yPos);
      yPos += textodescripcion.length * 5.2;

      doc.text(`Entidad: ${proyecto.entidad?.denominacion || 'Sin entidad'}`, margin, yPos);
      yPos += 7;
      doc.text(`Departamento: ${proyecto.departamento?.nombre || 'Sin departamento'}`, margin, yPos);
      yPos += 7;

      const fechaCreacion = proyecto.fecha_creado ? this.formatFecha(proyecto.fecha_creado) : 'Sin fecha';
      const fechaFinalizacion = proyecto.fecha_finalizacion ? this.formatFecha(proyecto.fecha_finalizacion) : 'Sin fecha';
      doc.text(`Fechas: Creación ${fechaCreacion} - Finalización ${fechaFinalizacion}`, margin, yPos);
      yPos += 10;

      if (proyecto.boletas && proyecto.boletas.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text(`Boletas asociadas (${proyecto.boletas.length}):`, margin, yPos);
        yPos += 7;

        const boletasData = proyecto.boletas.map((boleta: any) => [
          boleta.numero || 'N/A',
          boleta.tipo_boleta?.nombre || 'N/A',
          boleta.concepto || 'Sin concepto',
          'Bs. ' + (boleta.monto || 0).toLocaleString('es-BO')
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Número', 'Tipo', 'Concepto', 'Monto']],
          body: boletasData,
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 },
          headStyles: {
            fillColor: [101, 110, 113],
            textColor: 255,
            fontStyle: 'bold'
          },
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

  private formatFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) {
        const parts = fechaStr.split('/');
        if (parts.length === 3) {
          return fechaStr;
        }
        return '';
      }
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      return `${dia}/${mes}/${anio}`;
    } catch (e) {
      return '';
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
