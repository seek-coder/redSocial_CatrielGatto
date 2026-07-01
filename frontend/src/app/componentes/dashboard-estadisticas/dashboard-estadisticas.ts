import { Component, signal, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadisticasService } from '../../servicios/estadisticas.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.scss'
})
export class DashboardEstadisticasComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chartPubUsuario') chartPubUsuarioRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartComentarios') chartComentariosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartComPub') chartComPubRef!: ElementRef<HTMLCanvasElement>;

  fechaInicio = signal('');
  fechaFin = signal('');

  totalPublicaciones = signal(0);
  totalComentarios = signal(0);

  sinDatosPub = signal(false);
  sinDatosComentarios = signal(false);
  sinDatosComPub = signal(false);

  private chartPubUsuario: Chart | null = null;
  private chartComentarios: Chart | null = null;
  private chartComPub: Chart | null = null;

  private colores = [
    '#c9a96e', '#c45c6a', '#8a9a5b', '#8a7080', '#d4b87a',
    '#a0522d', '#6b4c5a', '#9e7b5d', '#b8860b', '#7a6a5a',
  ];

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit() {
    const hoy = new Date();
    const hace30 = new Date(hoy);
    hace30.setDate(hace30.getDate() - 30);

    this.fechaInicio.set(this.formatearFechaInput(hace30));
    this.fechaFin.set(this.formatearFechaInput(hoy));
  }

  ngAfterViewInit() {
    this.cargarTodo();
  }

  ngOnDestroy() {
    this.chartPubUsuario?.destroy();
    this.chartComentarios?.destroy();
    this.chartComPub?.destroy();
  }

  onFechaChange() {
    if (this.fechaInicio() && this.fechaFin()) {
      this.cargarTodo();
    }
  }

  private cargarTodo() {
    this.cargarPublicacionesPorUsuario();
    this.cargarComentariosTotales();
    this.cargarComentariosPorPublicacion();
  }

  private crearChartPub(datos: { usuario: string; cantidad: number }[]) {
    const labels = datos.map(d => d.usuario);
    const values = datos.map(d => d.cantidad);
    this.chartPubUsuario = new Chart(this.chartPubUsuarioRef.nativeElement, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: this.colores.slice(0, labels.length),
          borderColor: '#1a0f14',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e8ddd0',
              font: { family: 'Inter', size: 11 },
              padding: 12,
            },
          },
          title: {
            display: true,
            text: 'Publicaciones por usuario',
            color: '#c9a96e',
            font: { family: 'Playfair Display', size: 14, weight: 'bold' as const },
          },
        },
      },
    });
  }

  private crearChartComentarios(datos: { fecha: string; cantidad: number }[]) {
    const labels = datos.map(d => d.fecha);
    const values = datos.map(d => d.cantidad);
    this.chartComentarios = new Chart(this.chartComentariosRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Comentarios',
          data: values,
          borderColor: '#c9a96e',
          backgroundColor: 'rgba(201, 169, 110, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#c9a96e',
          pointBorderColor: '#1a0f14',
          pointBorderWidth: 2,
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#8a7080', font: { family: 'Inter', size: 10 } },
            grid: { color: 'rgba(138, 112, 128, 0.1)' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#8a7080', font: { family: 'Inter', size: 10 }, stepSize: 1 },
            grid: { color: 'rgba(138, 112, 128, 0.1)' },
          },
        },
        plugins: {
          legend: { labels: { color: '#e8ddd0', font: { family: 'Inter', size: 11 } } },
          title: {
            display: true,
            text: 'Comentarios por día',
            color: '#c9a96e',
            font: { family: 'Playfair Display', size: 14, weight: 'bold' as const },
          },
        },
      },
    });
  }

  private crearChartComPub(datos: { publicacion: string; cantidad: number }[]) {
    const labels = datos.map(d => d.publicacion.length > 25 ? d.publicacion.substring(0, 25) + '...' : d.publicacion);
    const values = datos.map(d => d.cantidad);
    this.chartComPub = new Chart(this.chartComPubRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Comentarios',
          data: values,
          backgroundColor: this.colores.slice(0, labels.length).map(c => c + '80'),
          borderColor: this.colores.slice(0, labels.length),
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: '#8a7080', font: { family: 'Inter', size: 10 }, stepSize: 1 },
            grid: { color: 'rgba(138, 112, 128, 0.1)' },
          },
          y: {
            ticks: { color: '#e8ddd0', font: { family: 'Inter', size: 10 } },
            grid: { color: 'rgba(138, 112, 128, 0.05)' },
          },
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Comentarios por publicación (top 10)',
            color: '#c9a96e',
            font: { family: 'Playfair Display', size: 14, weight: 'bold' as const },
          },
        },
      },
    });
  }

  private cargarPublicacionesPorUsuario() {
    this.estadisticasService.publicacionesPorUsuario(this.fechaInicio(), this.fechaFin()).subscribe({
      next: (datos) => {
        this.totalPublicaciones.set(datos.reduce((acc, d) => acc + d.cantidad, 0));
        this.chartPubUsuario?.destroy();
        this.chartPubUsuario = null;
        if (datos.length === 0) {
          this.sinDatosPub.set(true);
          return;
        }
        this.sinDatosPub.set(false);
        setTimeout(() => this.crearChartPub(datos), 0);
      },
    });
  }

  private cargarComentariosTotales() {
    this.estadisticasService.comentariosTotales(this.fechaInicio(), this.fechaFin()).subscribe({
      next: (datos) => {
        this.totalComentarios.set(datos.reduce((acc, d) => acc + d.cantidad, 0));
        this.chartComentarios?.destroy();
        this.chartComentarios = null;
        if (datos.length === 0) {
          this.sinDatosComentarios.set(true);
          return;
        }
        this.sinDatosComentarios.set(false);
        setTimeout(() => this.crearChartComentarios(datos), 0);
      },
    });
  }

  private cargarComentariosPorPublicacion() {
    this.estadisticasService.comentariosPorPublicacion(this.fechaInicio(), this.fechaFin()).subscribe({
      next: (datos) => {
        this.chartComPub?.destroy();
        this.chartComPub = null;
        if (datos.length === 0) {
          this.sinDatosComPub.set(true);
          return;
        }
        this.sinDatosComPub.set(false);
        setTimeout(() => this.crearChartComPub(datos), 0);
      },
    });
  }

  private formatearFechaInput(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
