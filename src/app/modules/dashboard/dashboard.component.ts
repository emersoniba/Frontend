import { Component, NgZone, OnDestroy } from '@angular/core';
import { BoletaService } from '../../services/boleta.service';
import { MatCardModule } from '@angular/material/card';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { CommonModule } from '@angular/common';
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnDestroy {
  stats = {
    total: 0,
    vigentes: 0,
    cumplidas: 0,
    renovadas: 0,
    vencidas: 0
  };

  vencimientoStats = {
    masDe15Dias: 0,
    de4a15Dias: 0,
    de0a3Dias: 0,
    vencidas: 0
  };

  tipos = {
    total: 0,
    poliza: 0,
    garantia: 0
  };

  loading = true;
  error = false;
  //private root!: am5.Root;
  private rootChart1: am5.Root | null = null;
  private rootChart2: am5.Root | null = null;
  private chart: any;

  constructor(
    private boletaService: BoletaService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadTipos();
    this.loadStats();
    this.loadVencimientoStats();

  }

  ngOnDestroy() {
    if (this.rootChart1) {
      this.rootChart1.dispose();
    }
    if (this.rootChart2) {
      this.rootChart2.dispose();
    }
  }
  //conteo fechas 
  loadVencimientoStats(): void {
    this.boletaService.getBoletasCountByVencimiento().subscribe({
      next: (response) => {
        this.vencimientoStats = response.data || response;
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
      }
    });
  }


  //grafico estados
  loadStats(): void {
    this.loading = true;
    this.error = false;
    this.boletaService.getBoletasCountByStatus().subscribe({
      next: (response) => {
        this.stats = response.data || response;
        this.loading = false;
        this.createPieChart();
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  createPieChart(): void {
    if (this.rootChart1) {
      this.rootChart1.dispose();
    }

    let root = am5.Root.new("chartdiv");

    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout
      })
    );

    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        colors: am5.ColorSet.new(root, {
          colors: [
            am5.color("#4CAF50"),  // Verde para Vigentes
            am5.color("#2196F3"),  // Azul para Cumplidas
            am5.color("#FFC107"),  // Amarillo para Renovadas
            am5.color("#F44336")   // Rojo para Vencidas
          ]
        })
      })
    );

    series.data.setAll([
      { category: "Vigentes", value: this.stats.vigentes },
      { category: "Cumplidas", value: this.stats.cumplidas },
      { category: "Renovadas", value: this.stats.renovadas },
      { category: "Vencidas", value: this.stats.vencidas },
    ]);
    series.labels.template.setAll({
      fontSize: 12
    });
    series.labels.template.set("text", "{category}: {value} ({percentage.formatNumber('0.0')}%)");
    this.rootChart1 = root;
  }

  //grafico tipos
  loadTipos(): void {
    this.loading = true;
    this.error = false;
    this.boletaService.getBoletasTipo().subscribe({
      next: (response) => {
        this.tipos = response.data || response;
        this.loading = false;
        this.createPieChartTipos();
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
  createPieChartTipos(): void {
    if (this.rootChart2) {
      this.rootChart2.dispose();
    }
    let root = am5.Root.new("chartipos");
    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout
      })
    );

    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        colors: am5.ColorSet.new(root, {
          colors: [
            am5.color("#6771DC"),  // Morado
            am5.color("#67B7DC")   // Teal
          ]
        })
      })
    );

    series.data.setAll([
      { category: "Poliza", value: this.tipos.poliza },
      { category: "Garantia", value: this.tipos.garantia },
    ]);
    series.labels.template.setAll({
      fontSize: 14
    });
    series.labels.template.set("text", "{category}: {value} ({percentage.formatNumber('0.0')}%)");
    this.rootChart2 = root;
  }

  descargarGrafico(chartId: string, nombreArchivo: string): void {
  console.log("Descargando gráfico:", chartId);

  const root = chartId === 'chartdiv' ? this.rootChart1 : this.rootChart2;

  if (!root) {
    console.error(`No se encontró el gráfico con ID ${chartId}`);
    return;
  }

  const exporting = am5plugins_exporting.Exporting.new(root, {
    filePrefix: nombreArchivo,
    pngOptions: { quality: 1 }
  });

  exporting.export("png");
}


}