import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Empresa } from '../../../../models/empresa.model';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import { MaterialModule } from '../../../../shared/app.material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reporte-empresa',
  templateUrl: './reporte-empresa.component.html',
  imports: [MatButtonModule, MaterialModule, NgxMatSelectSearchModule, CommonModule],
  styleUrls: ['./reporte-empresa.component.css']
})
export class ReporteEmpresaComponent implements OnInit, OnDestroy {
  empresas: Empresa[] = [];
  filteredEmpresas: Empresa[] = [];
  filterForm: FormGroup;
  nombreFilterCtrl = new FormControl<string>('');
  nitFilterCtrl = new FormControl<string>('');
  actividadFilterCtrl = new FormControl<string>('');
  nombresFiltrados: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  nitsFiltrados: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  actividadesFiltradas: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ReporteEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empresas: Empresa[] },
    private fb: FormBuilder
  ) {
    //
      console.log('Datos recibidos:', data);
console.log('Empresas después de filtrar:', JSON.stringify(this.empresas, null, 2));
  this.empresas = (data.empresas || [])
    .filter(empresa => !empresa.fecha_eliminacion || empresa.fecha_eliminacion === null)
    .map(empresa => {
      // Asegurarnos que los proyectos también están filtrados
      const proyectosFiltrados = (empresa.proyectos || [])
        .filter(proyecto => !proyecto.fecha_eliminacion || proyecto.fecha_eliminacion === null);
      console.log('aaaaaaaaaaa',proyectosFiltrados);
      return {
        ...empresa,
        proyectos: proyectosFiltrados
      };
    });
  
  this.filteredEmpresas = [...this.empresas];
//
    this.filterForm = this.fb.group({
      nombreSeleccionado: [''],
      nitSeleccionado: [''],
      actividadSeleccionada: ['']
    });
  }

  ngOnInit(): void {
    this.nombresFiltrados.next(this.getNombresUnicos());
    this.nitsFiltrados.next(this.getNitsUnicos());
    this.actividadesFiltradas.next(this.getActividadesUnicas());
    this.nombreFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => this.filtrarNombres());

    this.nitFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => this.filtrarNits());

    this.actividadFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => this.filtrarActividades());

    this.filterForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  getNombresUnicos(): string[] {
    return [...new Set(this.empresas.map(e => e.denominacion))];
  }

  getNitsUnicos(): string[] {
    return [...new Set(this.empresas.map(e => e.nit))];
  }

  getActividadesUnicas(): string[] {
    return [...new Set(this.empresas.map(e => e.actividad?.descripcion || 'Sin actividad'))];
  }

  filtrarNombres(): void {
    const search = this.nombreFilterCtrl.value?.toLowerCase() || '';
    this.nombresFiltrados.next(
      this.getNombresUnicos().filter(nombre =>
        nombre.toLowerCase().includes(search))
    );
  }

  filtrarNits(): void {
    const search = this.nitFilterCtrl.value?.toLowerCase() || '';
    this.nitsFiltrados.next(
      this.getNitsUnicos().filter(nit =>
        nit.toLowerCase().includes(search))
    );
  }

  filtrarActividades(): void {
    const search = this.actividadFilterCtrl.value?.toLowerCase() || '';
    this.actividadesFiltradas.next(
      this.getActividadesUnicas().filter(actividad =>
        actividad.toLowerCase().includes(search))
    );
  }

  aplicarFiltros(): void {
    const { nombreSeleccionado, nitSeleccionado, actividadSeleccionada } = this.filterForm.value;

    this.filteredEmpresas = this.empresas.filter(empresa => {
      const cumpleNombre = !nombreSeleccionado || empresa.denominacion === nombreSeleccionado;
      const cumpleNit = !nitSeleccionado || empresa.nit === nitSeleccionado;
      const actividadEmpresa = empresa.actividad?.descripcion || 'Sin actividad';
      const cumpleActividad = !actividadSeleccionada || actividadEmpresa === actividadSeleccionada;

      return cumpleNombre && cumpleNit && cumpleActividad;
    });
  }

  generarExcel(): void {
    const titulo = [['REPORTE DE EMPRESAS']];
    const encabezados = [['Empresa', 'Actividad', 'NIT', 'Representante Legal', 'Contacto', 'Correo']];
    const datos = this.filteredEmpresas.map(empresa => [
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
      { wch: 30 }, { wch: 25 }, { wch: 15 },
      { wch: 30 }, { wch: 20 }, { wch: 30 }
    ];

    worksheet['A1'].s = {
      font: { bold: true, italic: true, sz: 14 },
      alignment: { horizontal: 'center' }
    };

    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Empresas': worksheet },
      SheetNames: ['Empresas']
    };

    XLSX.writeFile(workbook, 'Reporte_Empresas.xlsx', { compression: true });
    this.dialogRef.close();
  }

  async generarPDF(): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    const logo1 = await this.convertImageToBase64('assets/img/logomopsv.png');
    const fechaActual = new Date();
    const fechaFormateada = `${fechaActual.getDate().toString().padStart(2, '0')}/${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}/${fechaActual.getFullYear()}`;
    const horaFormateada = `${fechaActual.getHours().toString().padStart(2, '0')}:${fechaActual.getMinutes().toString().padStart(2, '0')}`;

    const drawHeader = () => {
      const logo1Width = 120;
      const logoHeight = 20;
      doc.addImage(logo1, 'PNG', margin, 10, logo1Width, logoHeight);
      doc.setFontSize(8);
      doc.text(`Fecha: ${fechaFormateada}`, pageWidth - margin, 30, { align: 'right' });
      doc.text(`Hora: ${horaFormateada}`, pageWidth - margin, 33, { align: 'right' });
    };

    drawHeader();
    let yPos = 45;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE EMPRESAS CON PROYECTOS', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    for (const empresa of this.filteredEmpresas) {
      const espacioNecesario = 50 + (empresa.proyectos?.length || 0) * 7;

      if (yPos + espacioNecesario > 270) {
        doc.addPage();
        drawHeader();
        yPos = 40;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Empresa: ${empresa.denominacion}`, margin, yPos); yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Actividad: ${empresa.actividad?.descripcion || 'Sin actividad'}`, margin, yPos); yPos += 6;
      doc.text(`NIT: ${empresa.nit}`, margin, yPos); yPos += 6;
      doc.text(`Representante Legal: ${empresa.representante_legal}`, margin, yPos); yPos += 6;
      doc.text(`Contacto: ${empresa.contacto}`, margin, yPos); yPos += 6;
      doc.text(`Correo: ${empresa.correo}`, margin, yPos); yPos += 10;

      if (empresa.proyectos && empresa.proyectos.length > 0) {
        
        doc.setFont('helvetica', 'bold');
        doc.text('Proyectos relacionados:', margin, yPos); yPos += 8;

        const proyectosData = empresa.proyectos.map(proyecto => [
          proyecto.nombre,
          proyecto.descripcion,
          this.formatFecha(proyecto.fecha_creado),
          this.formatFecha(proyecto.fecha_finalizacion),
          proyecto.departamento?.nombre || 'Sin departamento'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Nombre', 'Descripción', 'Inicio', 'Finalización', 'Departamento']],
          body: proyectosData,
          theme: 'grid',
          headStyles: { fillColor: [101, 110, 113], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text('Proyectos relacionados:', margin, yPos); yPos += 6;
        doc.setFont('helvetica', 'italic');
        doc.text('No hay proyectos relacionados', margin, yPos); yPos += 10;
      }

      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
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

    doc.save('Reporte_Empresas_Proyectos.pdf');
    this.dialogRef.close();
  }

  private formatFecha(fechaStr: string): string {
    if (!fechaStr) return 'Sin fecha';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'Sin fecha';

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