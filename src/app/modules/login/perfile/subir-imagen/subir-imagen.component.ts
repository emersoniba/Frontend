import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/app.material';

import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { PersonaService } from '../../../../services/persona.service';
@Component({
	selector: 'app-subir-imagen',
	standalone: true,
	imports: [CommonModule, MaterialModule, ReactiveFormsModule,],
	templateUrl: './subir-imagen.component.html',
	styleUrl: './subir-imagen.component.css'
})

export class SubirImagenComponent {

	form: FormGroup;
	imagenBase64: string | null = null;
	imagenActual: string | null = null;
	ci: string = '';

	constructor(
		private fb: FormBuilder,
		private personaService: PersonaService,
		private errorHandler: ErrorHandlerService,
		private dialogRef: MatDialogRef<SubirImagenComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { ci: string, imagenActual: string }
	) {
		this.form = this.fb.group({});
		this.ci = data.ci;

		if (data.imagenActual) {
			this.imagenActual = data.imagenActual.startsWith('data:')
				? data.imagenActual
				: `data:image/jpeg;base64,${data.imagenActual}`;
		}
	}


	ngOnInit(): void {
		if (!this.imagenActual) {
			this.obtenerImagenActual();
		}
	}


	obtenerImagenActual(): void {
		this.personaService.getPerfil().subscribe({
			next: (resp) => {
				const base64 = resp?.data.persona?.imagen;
				if (base64) {
					this.imagenActual = base64.startsWith('data:')
						? base64
						: `data:image/jpeg;base64,${base64}`;
				}
			},
			error: (error) => this.errorHandler.handleError(error, 'No se pudieron cargar los roles')
		});
	}


	convertirImagen(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const archivo = input.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const resultado = reader.result as string;
				this.imagenBase64 = resultado;
			};
			reader.readAsDataURL(archivo);
		}
	}

	enviarImagen(): void {
		if (!this.imagenBase64) {
			alert('Primero seleccione una imagen');
			return;
		}
		this.personaService.subirImagen(this.ci, this.imagenBase64).subscribe({
			next: (resp) => {
				this.dialogRef.close(true);
				window.location.reload();
			},
			error: (error) => {
				this.errorHandler.handleError(error, 'No se pudieron cargar los roles');
				this.dialogRef.close(false);
			}
		});
	}
	cancelar() {
		this.dialogRef.close(null);
	}
}