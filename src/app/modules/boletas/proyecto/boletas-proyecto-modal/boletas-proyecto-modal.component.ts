import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BoletaService } from '../../../../services/boleta.service';
import { Proyecto } from '../../../../services/proyecto.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
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
    @Inject(MAT_DIALOG_DATA) public data: { proyecto: Proyecto },
   // private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.cargarBoletas();
  }

  cargarBoletas(): void {
    this.boletaService.getBoletasPorProyecto(this.data.proyecto.id!).subscribe({
      next: (boletas) => { 
        this.boletas = boletas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando boletas:', err);
        this.loading = false;
      } 
    });
  }

  calcularTotal(): number {
    return this.boletas.reduce((sum, boleta) => sum + (boleta.monto || 0), 0);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}