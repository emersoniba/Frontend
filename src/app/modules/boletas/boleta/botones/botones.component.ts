import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { VerBoletaPdfComponent } from '../ver-boleta-pdf/ver-boleta-pdf.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/app.material';
@Component({
  selector: 'app-botones',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './botones.component.html',
  styleUrls: ['./botones.component.css']
})
export class BotonesComponent implements ICellRendererAngularComp {
  public params: any;

  constructor(private dialog: MatDialog) {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  editar() {
    this.params.context.componentParent.abrirModalEditar(this.params.data);
  }

  eliminar() {
    this.params.context.componentParent.eliminarBoleta(this.params.data.id);
  }

  verPDF() {
    const idBoleta = this.params.data.id;
    this.dialog.open(VerBoletaPdfComponent, {
      width: '90%',
      data: { idBoleta }
    });
  }
}

  

