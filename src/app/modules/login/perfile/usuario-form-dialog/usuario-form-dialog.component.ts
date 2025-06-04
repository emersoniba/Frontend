
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { PersonaService } from '../../../../services/persona.service';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

import { Departamento, Persona } from '../../../../models/auth.interface';
import { DepartamentoService } from '../../../../services/departamento.service';

@Component({
	selector: 'app-usuario-form-dialog',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogModule,
		MatButtonModule, MatSelectModule, MatIconModule],
	templateUrl: './usuario-form-dialog.component.html',
	styleUrl: './usuario-form-dialog.component.css'
})
export class UsuarioFormDialogComponent implements OnInit{

	formPersona!: FormGroup;
	esEdicion: boolean = false;
	dataDepartamentos: Departamento[] = [] as Departamento[];

	constructor(
		private fb: FormBuilder,
		private dialogRef: MatDialogRef<UsuarioFormDialogComponent>,
		private personaService: PersonaService,
		private departamentoService: DepartamentoService,
		@Inject(MAT_DIALOG_DATA) public data: Persona
	) {
		this.getFormBuilder();
		if (data) {
			this.esEdicion = true;
			console.log(data);
			this.formPersona.patchValue({
				ci: data.ci,
				departamento_id: data.departamento?.id,
				nombres: data.nombres,
				apellido_paterno: data.apellido_paterno,
				apellido_materno: data.apellido_materno,
				cargo: data.cargo,
				unidad: data.unidad,
				telefono: data.telefono,
				direccion: data.direccion,
				correo: data.correo
			})
		}
	}

	ngOnInit(): void {
		this.getAllDepartamentos();
	}

	public getAllDepartamentos(){
		this.departamentoService.getDepartamentos().subscribe({
			next: (response) => {
				this.dataDepartamentos = response;
			}
		});
	}

	public getFormBuilder(): void {
		this.formPersona = this.fb.group({
			ci: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
			departamento_id: ['', Validators.required],
			nombres: ['', [Validators.required, Validators.minLength(3)]],
			apellido_paterno: ['', [Validators.required, Validators.minLength(3)]],
			apellido_materno: ['', [Validators.required, Validators.minLength(3)]],
			cargo: ['', [Validators.required, Validators.minLength(5)]],
			unidad: ['', [Validators.required, Validators.minLength(5)]],
			telefono: ['', [Validators.required, Validators.maxLength(8), Validators.minLength(7)
				, Validators.pattern(/^\d+$/)]],
			direccion: ['', [Validators.required, Validators.minLength(5)]],
			correo: ['', [Validators.required, Validators.email]]
		})
	}

	registrar(): void {
		if (this.formPersona.invalid) {
			this.formPersona.markAllAsTouched();
			return;
		}

		const personaData = this.formPersona.value;

		const save$ = this.esEdicion
			? this.personaService.putPersona(personaData.ci, personaData)
			: this.personaService.postPersona(personaData);

		save$.subscribe({
			next: (res) => {
				this.dialogRef.close(res);
			},
			error: (error) => {
				if (error.status === 400 && error.error) {
					if (error.error.ci) {
						this.formPersona.get('ci')?.setErrors({ backend: error.error.ci[0] });
					}
					if (error.error.correo) {
						this.formPersona.get('correo')?.setErrors({ backend: error.error.correo[0] });
					}

					Swal.fire(
						'Error de validación',
						'CI o correo ya están registrados en otra persona.',
						'error'
					);
				} else {
					console.error('Error al registrar persona', error);
					Swal.fire('Error', 'Ocurrió un error inesperado al guardar la persona.', 'error');
				}
			}
		});
	}

	cancelar(): void {
		this.formPersona.reset();
		this.dialogRef.close();
	}

}


