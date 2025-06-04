import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Estado, EntidadFinanciera, Boleta } from '../../../../models/boleta.model';
import { ProyectoService } from '../../../../services/proyecto.service';
import { BoletaService } from '../../../../services/boleta.service';
import { EntidadFinancieraService } from '../../../../services/entidad-financiera.service';
import { EstadoService } from '../../../../services/estado.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, startWith, map } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { Proyecto } from '../../../../models/proyecto.model';

export const MY_DATE_FORMATS = {
	parse: {
		dateInput: 'DD/MM/YYYY',
	},
	display: {
		dateInput: 'DD/MM/YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};
@Component({
	standalone: true,
	selector: 'app-boleta-modal',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './boleta-modal.component.html',
	styleUrls: ['./boleta-modal.component.css'],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDatepickerModule,
		MatDialogModule,
		MatButtonModule,
		MatNativeDateModule,
		MatMomentDateModule,
		MatIconModule
	],
	providers: [
		{ provide: DateAdapter, useClass: NativeDateAdapter },
		{ provide: MAT_DATE_LOCALE, useValue: 'es-BO' },
		{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }

	]
})
export class BoletaModalComponent implements OnInit, OnDestroy {
	boletaForm: FormGroup;
	isEditing: boolean = false;
	estados: Estado[] = [];
	entidadesFinancieras: EntidadFinanciera[] = [];
	proyectos: Proyecto[] = [];
	filteredProyectos: Proyecto[] = [];
	archivoSeleccionado: File | null = null;

	// Control para el filtro de proyectos
	proyectoFilterCtrl = new FormControl('');
	private _onDestroy = new Subject<void>();

	constructor(
		private fb: FormBuilder,
		private dialogRef: MatDialogRef<BoletaModalComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { boleta: Boleta | null },
		private boletaService: BoletaService,
		private proyectoService: ProyectoService,
		private estadoService: EstadoService,
		private entidadFinancieraService: EntidadFinancieraService
	) {
		this.boletaForm = this.fb.group({
			tipo: ['', Validators.required],
			numero: ['', Validators.required],
			concepto: ['', Validators.required],
			entidad_financiera_id: [null, Validators.required],
			//fecha_inicio: [new Date(), Validators.required],
			// fecha_finalizacion: [new Date(), Validators.required],
			fecha_inicio: [moment(), Validators.required],
			fecha_finalizacion: [moment(), Validators.required],
			monto: [0, [Validators.required, Validators.min(0)]],
			cite: [''],
			estado_id: [null, Validators.required],
			proyecto_id: [null, Validators.required],
			observaciones: [''],
			nota_ejecucion: [''],
			archivo: [null]
		});
	}

	ngOnInit(): void {
		this.loadData();
		if (this.data.boleta) {
			this.isEditing = true;
			this.loadBoletaData(this.data.boleta);
		}

		// Configuración del filtro de proyectos con debounce
		this.proyectoFilterCtrl.valueChanges
			.pipe(
				takeUntil(this._onDestroy),
				debounceTime(300),
				distinctUntilChanged(),
				startWith('')
			)
			.subscribe(search => {
				this.filterProyectos(search || '');
			});
	}

	loadData(): void {
		this.loadEstados();
		this.loadEntidadesFinancieras();
		this.loadProyectos();
	}

	loadProyectos(): void {
		this.proyectoService.getProyectos().subscribe({
			next: (data) => {
				this.proyectos = data;
				this.filteredProyectos = [...this.proyectos]; // Copia inicial
			},
			error: (err) => console.error('Error cargando proyectos:', err)
		});
	}

	loadEstados(): void {
		this.estadoService.getEstados().subscribe({
			next: (data) => this.estados = data,
			error: (err) => console.error('Error cargando estados:', err)
		});
	}

	loadEntidadesFinancieras(): void {
		this.entidadFinancieraService.getEntidadesFinancieras().subscribe({
			next: (data) => this.entidadesFinancieras = data,
			error: (err) => console.error('Error cargando entidades financieras:', err)
		});
	}

	loadBoletaData(boleta: Boleta): void {
		// Si las fechas vienen como strings en formato ISO
		const fechaInicio = moment(boleta.fecha_inicio, moment.ISO_8601).isValid()
			? moment(boleta.fecha_inicio)
			: moment(boleta.fecha_inicio, 'DD-MM-YYYY:mm:ss');//'YYYY-MM-DD HH:mm:ss');

		const fechaFin = moment(boleta.fecha_finalizacion, moment.ISO_8601).isValid()
			? moment(boleta.fecha_finalizacion)
			: moment(boleta.fecha_finalizacion, 'DD-MM-YYYY:mm:ss');

		this.boletaForm.patchValue({
			...boleta,
			fecha_inicio: fechaInicio.toDate(),
			fecha_finalizacion: fechaFin.toDate(),
			entidad_financiera_id: boleta.entidad_financiera?.id,
			estado_id: boleta.estado.id,
			proyecto_id: boleta.proyecto.id
		});
	}

	filterProyectos(search: string): void {
		if (!search) {
			this.filteredProyectos = [...this.proyectos];
			return;
		}

		const searchLower = search.toLowerCase();
		this.filteredProyectos = this.proyectos.filter(p =>
			p.nombre.toLowerCase().includes(searchLower)
		);
	}

	isUploading = false;
	archivoNombre: string = '';

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		this.archivoSeleccionado = input.files[0];
		this.archivoNombre = this.archivoSeleccionado.name;

		this.isUploading = true;
		const file = input.files[0];
		const reader = new FileReader();

		reader.onload = () => {
			const base64String = reader.result as string;
			this.boletaForm.patchValue({
				archivo: base64String
			});
			this.isUploading = false;
		};

		reader.onerror = () => {
			this.isUploading = false;
			Swal.fire('Error', 'No se pudo leer el archivo', 'error');
		};

		reader.readAsDataURL(file);
	}


	onSubmit(): void {
		if (this.boletaForm.invalid) {
			Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
			return;
		}

		const formValue = this.boletaForm.value;
		const boletaData = {
			...formValue,
			fecha_inicio: moment(formValue.fecha_inicio).toISOString(),
			fecha_finalizacion: moment(formValue.fecha_finalizacion).toISOString(),

			creado_por_id: 1,
			actualizado_por_id: 1
		};


		if (this.isEditing && this.data.boleta?.id) {
			this.updateBoleta(this.data.boleta.id, boletaData);
		} else {
			this.createBoleta(boletaData);
		}
	}

	createBoleta(boletaData: any): void {
		this.boletaService.createBoleta(boletaData).subscribe({
			next: () => {
				Swal.fire({
					icon: 'success',
					title: 'Boleta creada',
					text: 'La boleta fue registrada exitosamente',
					timer: 2000,
					showConfirmButton: false
				});
				this.dialogRef.close(true);
			},
			error: (err) => {
				console.error('Error creando boleta:', err);
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'No se pudo crear la boleta'
				});
			}
		});
	}

	updateBoleta(id: number, boletaData: any): void {
		Swal.fire({
			title: '¿Está seguro?',
			text: '¿Desea actualizar esta boleta?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Sí, actualizar',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.isConfirmed) {
				this.boletaService.updateBoleta(id, boletaData).subscribe({
					next: () => {
						Swal.fire({
							icon: 'success',
							title: 'Boleta actualizada',
							text: 'La boleta fue actualizada exitosamente',
							timer: 2000,
							showConfirmButton: false
						});
						this.dialogRef.close(true);
					},
					error: (err) => {
						console.error('Error actualizando boleta:', err);
						Swal.fire({
							icon: 'error',
							title: 'Error',
							text: 'No se pudo actualizar la boleta'
						});
					}
				});
			}
		});
	}

	ngOnDestroy(): void {
		this._onDestroy.next();
		this._onDestroy.complete();
	}
}
