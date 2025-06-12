import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PersonaService } from '../../../../services/persona.service';
@Component({
	selector: 'app-subir-imagen',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule],
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

		private dialogRef: MatDialogRef<SubirImagenComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { ci: string, imagenActual: string }
	) {
		this.form = this.fb.group({});
		this.ci = data.ci;
		this.imagenActual = data.imagenActual;

	}


	ngOnInit(): void {
		this.obtenerImagenActual();
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
			error: (err) => {
				console.error('Error al obtener imagen del perfil', err);
			}
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
				console.log('Imagen subida', resp);
				this.dialogRef.close(true);
			},
			error: (err) => {
				console.error('Error al subir imagen', err);
				this.dialogRef.close(false);
			}
		});
	}
	cancelar() {
		this.dialogRef.close(null);
	}
}