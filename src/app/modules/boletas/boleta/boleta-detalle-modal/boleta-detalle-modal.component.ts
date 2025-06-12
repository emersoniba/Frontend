// boleta-detalle-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Boleta } from '../../../../models/boleta.model';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    
  ],
  selector: 'app-boleta-detalle-modal',
  templateUrl: './boleta-detalle-modal.component.html',
  styleUrls: ['./boleta-detalle-modal.component.css'],
  providers: [DatePipe]
})
export class BoletaDetalleModalComponent {
  constructor(
    public dialogRef: MatDialogRef<BoletaDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { boleta: Boleta },
    private datePipe: DatePipe
  ) {}

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return this.datePipe.transform(dateString, 'dd/MM/yyyy') || '';
  }

  formatCurrency(amount: number): string {
    return amount ? `$${amount.toLocaleString()}` : '$0';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}