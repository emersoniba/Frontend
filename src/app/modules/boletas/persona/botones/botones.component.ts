import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';


@Component({
	selector: 'app-botones',
	standalone: true,
	imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
	templateUrl: './botones.component.html',
	styleUrl: './botones.component.css'
})
export class BotonesComponent implements ICellRendererAngularComp {
	private params: any;

	agInit(params: ICellRendererParams): void {
		this.params = params;
	}

	refresh(params: ICellRendererParams) {
        return true;
    }

	editar() {
		this.params.context.componentParent.onCellClicked({ci: this.params.data.ci, option: 'editar'});
	}

	eliminar() {
		this.params.context.componentParent.onCellClicked({ci: this.params.data.ci, option: 'eliminar'});
	}

	tieneUsuario(): boolean {
		return !!this.params.data.username && Object.keys(this.params.data.usuario).length > 0;
	}

	crearUsuario(): void {
		const ci = this.params.data.ci;
		this.params.context.componentParent.crearUsuario(ci);
	}

	get sinUsuario(): boolean {
		const usuario = this.params?.data?.usuario;
		return !usuario || Object.keys(usuario).length === 0;
	}

	editarRol(): void {
		const ci = this.params.data.ci;
		this.params.context.componentParent.editarRol(ci);
	}
}


