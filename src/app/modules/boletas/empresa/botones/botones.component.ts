import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { CommonModule } from '@angular/common'; //
@Component({
  selector: 'app-botones',

  //standalone: true,

  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
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


