import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BoletaService } from '../../../services/boleta.service';
import { Boleta } from '../../../models/boleta.model';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
//import { BoletaModalComponent } from './boleta-modal/boleta-modal.component';
import Swal from 'sweetalert2';
import { BoletaModalComponent } from './boleta-modal/boleta-modal.component';

//v1
@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    BoletaComponent,
    BoletaModalComponent
  ],
  selector: 'app-boleta',
  templateUrl: './boleta.component.html',
  styleUrls: ['./boleta.component.css'],
  //exports: [BoletaComponent]

})
export class BoletaComponent implements OnInit {
  boletas: Boleta[] = [];
  displayedColumns: string[] = [
    'numero',
    'tipo',
    'concepto',
    'monto',
    'cite',
    'entidad_financiera',
    'fecha_inicio',
    'fecha_finalizacion',
    'estado',
    'proyecto',
    'nota_ejecucion',
    'acciones',
    //'archivo_adjunto',
  ];
  loading = false;

  constructor(
    private boletaService: BoletaService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarBoletas();
  }

  cargarBoletas(): void {
    this.loading = true;
    this.boletaService.getBoletas().subscribe({
      next: (data) => {
        this.boletas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando boletas:', err);
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    const dialogRef = this.dialog.open(BoletaModalComponent, {
      data: { boleta: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarBoletas();
      }
    });
  }

  abrirModalEditar(boleta: Boleta): void {
    const dialogRef = this.dialog.open(BoletaModalComponent, {
      data: { boleta }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarBoletas();
      }
    });
  }

  eliminarBoleta(id?: number): void {
    if (!id) return;

    Swal.fire({
      title: '¿Eliminar boleta?',
      text: 'No podrás deshacer esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.boletaService.deleteBoleta(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La boleta ha sido eliminada.', 'success');
            this.cargarBoletas();
          },
          error: (err) => {
            console.error('Error eliminando boleta:', err);
            Swal.fire('Error', 'Hubo un problema al eliminar la boleta.', 'error');
          }
        });
      }
    });
  }
}