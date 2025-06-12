import { Component, NgZone, OnDestroy } from '@angular/core';
import { BoletaService } from '../../../services/boleta.service';
import { MatCardModule } from '@angular/material/card';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { CommonModule } from '@angular/common';
//
import * as am5exporting from "@amcharts/amcharts5/plugins/exporting";
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, CommonModule,MatIconModule],
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
    let title = chart.children.unshift(
      am5.Label.new(root, {
        text: "Estados de las Boletas",
        fontSize: 20,
        fontWeight: "500",
        textAlign: "center",
        x: am5.percent(50),
        centerX: am5.percent(50),
        paddingBottom: 10
      })
    );
    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        colors: am5.ColorSet.new(root, {
          colors: [
            am5.color("#4CAF50"),  // Verde
            am5.color("#2196F3"),  // Azul 
            am5.color("#FFC107"),  // Amarillo
            am5.color("#F44336")   // Rojo 
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
    // 👇 Export plugin aquí
    am5exporting.Exporting.new(root, {
      filePrefix: "grafico_estados_boleta",
      menu: am5exporting.ExportingMenu.new(root, {}),
    });
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
    let title = chart.children.unshift(
      am5.Label.new(root, {
        text: "Tipos de Boletas",
        fontSize: 20,
        fontWeight: "500",
        textAlign: "center",
        x: am5.percent(50),
        centerX: am5.percent(50),
        paddingBottom: 10
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
    am5exporting.Exporting.new(root, {
      filePrefix: "grafico_tipos_boleta",
      menu: am5exporting.ExportingMenu.new(root, {}),
    });
    this.rootChart2 = root;
  }
  exportChart1() {
    if (this.rootChart1) {
      let exp = am5exporting.Exporting.new(this.rootChart1, {});
      exp.download("png");
    }
  }

  exportChart2() {
    if (this.rootChart2) {
      let exp = am5exporting.Exporting.new(this.rootChart2, {});
      exp.download("png");
    }
  }
}