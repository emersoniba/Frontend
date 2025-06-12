import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CurrencyPipe } from '@angular/common';
import { BoletaService } from '../../../../services/boleta.service';
import { Boleta } from '../../../../models/boleta.model';
import { Proyecto } from '../../../../models/proyecto.model';
import { MaterialModule } from '../../../../shared/app.material';


@Component({
	standalone: true,
	imports: [
		CommonModule,
		MaterialModule
	],
	selector: 'app-boletas-proyecto-modal',
	templateUrl: './boletas-proyecto-modal.component.html',
	styleUrls: ['./boletas-proyecto-modal.component.css'],
	providers: [CurrencyPipe]
})
export class BoletasProyectoModalComponent implements OnInit {
	boletas: any[] = [];
	displayedColumns: string[] = ['numero', 'tipo', 'concepto', 'monto'];
	loading = true;

	constructor(
		private boletaService: BoletaService,
		public dialogRef: MatDialogRef<BoletasProyectoModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: Proyecto,
	) { }

	ngOnInit(): void {
		this.cargarBoletas();
	}

	cargarBoletas(): void {
		this.boletaService.getBoletasPorProyecto(this.data.id!).subscribe({
			next: (response) => {
				this.boletas = response.data as Boleta[];
				this.loading = false;
			},
			error: (err) => {
				this.loading = false;
			}
		});
	}

	calcularTotal(): number {
		return this.boletas.reduce((sum, boleta) => sum + (Number(boleta.monto) || 0), 0);
	}

	onClose(): void {
		this.dialogRef.close();
	}
}
