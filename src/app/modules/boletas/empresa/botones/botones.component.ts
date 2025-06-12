import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../../shared/app.material';

import { ICellRendererAngularComp } from 'ag-grid-angular';


@Component({
  selector: 'app-botones',
  standalone: true,
  imports: [CommonModule, MaterialModule],

  templateUrl: './botones.component.html',
  styleUrl: './botones.component.css'
})


export class BotonesComponent implements ICellRendererAngularComp {
  private params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  editar() {
    this.params.context.componentParent.editar(this.params.data.id);
  }

  eliminar() {
    this.params.context.componentParent.eliminar(this.params.data.id);
  }

}


