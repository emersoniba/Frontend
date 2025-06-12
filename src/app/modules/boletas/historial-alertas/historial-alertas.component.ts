// components/historial-alertas/historial-alertas.component.ts
import { Component, OnInit } from '@angular/core';
import { AlertasService } from '../../../services/alertas.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-historial-alertas',
  templateUrl: './historial-alertas.component.html',
  styleUrls: ['./historial-alertas.component.scss']
})
export class HistorialAlertasComponent implements OnInit {
  historial: any[] = [];
  loading = true;
  boletaId: string | null = null;

  constructor(
    private alertasService: AlertasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.boletaId = params['id'] || null;
      this.loadHistorial();
    });
  }
// components/historial-alertas/historial-alertas.component.ts
getTipoAlertaDisplay(tipo: string): string {
  const tipos: {[key: string]: string} = {
    'alerta_15_dias': '15 días',
    'alerta_7_dias': '7 días',
    'alerta_3_dias': '3 días'
  };
  return tipos[tipo] || tipo;
}
  loadHistorial(): void {
    this.loading = true;
    const filters: any = {};
    if (this.boletaId) {
      filters['boleta__id'] = this.boletaId;
    }

    this.alertasService.getHistorialAlertas(filters).subscribe({
      next: (data) => {
        this.historial = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.loading = false;
      }
    });
  }
}