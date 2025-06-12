import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BoletaService } from '../../../../services/boleta.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
@Component({
  selector: 'app-ver-boleta-pdf',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './ver-boleta-pdf.component.html',
  styleUrl: './ver-boleta-pdf.component.css'
})
export class VerBoletaPdfComponent implements OnInit {
  pdfUrl: SafeResourceUrl | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { idBoleta: number },
    private boletaService: BoletaService,
    private sanitizer: DomSanitizer,

    private errorHandler: ErrorHandlerService
    
  ) {}

  ngOnInit(): void {
    this.obtenerPDF();
  }

  obtenerPDF(): void {
    const id = this.data.idBoleta;
    console.log
    this.boletaService.verBoletaPDF(id).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      },
       error: (error) => this.errorHandler.handleError(error, 'Ocurrió un error al cargar el docuemnto')
    });
  }
}
