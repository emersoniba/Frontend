import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MaterialModule } from '../../../../shared/app.material';


@Component({
	selector: 'app-botones-proyecto',
	standalone: true,
	imports: [
		CommonModule,
		MaterialModule
	],
	templateUrl: './botones-proyecto.component.html',
	styleUrl: './botones-proyecto.component.css'
})
export class BotonesProyectoComponent implements ICellRendererAngularComp {
	private params: any;

	agInit(params: ICellRendererParams): void {
		this.params = params;
	}

	refresh(params: ICellRendererParams) {
        return true;
    }

	editar() {
		this.params.context.componentParent.onCellClicked({proyecto: this.params.data, option: 'editar'});
	}

	eliminar() {
		this.params.context.componentParent.onCellClicked({proyecto: this.params.data, option: 'eliminar'});
	}

	verboletas(){
		this.params.context.componentParent.onCellClicked({proyecto: this.params.data, option: 'verboletas'});
	}
}
