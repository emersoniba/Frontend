import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MaterialModule } from '../../../shared/app.material';

import { UsuarioFormDialogComponent } from './usuario-form-dialog/usuario-form-dialog.component';
import { CambiarPasswordComponent } from './cambiar-password/cambiar-password.component';
import { SubirImagenComponent } from './subir-imagen/subir-imagen.component';
import { Persona } from '../../../models/auth.interface';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { PersonaService } from '../../../services/persona.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
	selector: 'app-perfile',
	standalone: true,
	imports: [
		MatGridListModule,
		ReactiveFormsModule,
		CommonModule,
		MaterialModule,
	],
	templateUrl: './perfile.component.html',
	styleUrl: './perfile.component.css'
})

export class PerfileComponent implements OnInit, OnDestroy {

	public perfil?: Persona;
	private perfilSubscriptor?: Subscription;

	private personaSubscriptor?: Subscription;
	public imagenPreview: string | null = null;
	public convertido: string | null = null;

	constructor(
		private readonly personaService: PersonaService,
		private readonly dialog: MatDialog,
		private readonly errorHandler: ErrorHandlerService,
		private cdr: ChangeDetectorRef,

	) { }

	ngOnInit(): void {
		this.cargarPerfil();
	}

	ngOnDestroy(): void {
		this.personaSubscriptor?.unsubscribe();
		this.perfilSubscriptor?.unsubscribe();
	}

	public cargarPerfil(): void {
		this.perfilSubscriptor = this.personaService.getPerfil().subscribe({
			next: (response) => {
				this.perfil = response.data as Persona;

				if (this.perfil?.imagen) {
					this.imagenPreview = 'data:image/png;base64,' + this.perfil.imagen;
				} else {
					this.imagenPreview = null;
				}
			},
			error: (error) => this.errorHandler.handleError(error, 'No se pudo cargar el perfil.')
		});
	}

	public editar(): void {
		if (!this.perfil) return;
		this.dialog.open(UsuarioFormDialogComponent, {
			width: '40vw',
			maxWidth: '60vw',
			disableClose: true,
			data: this.perfil
		}).afterClosed().subscribe(result => {
			if (result) {
				this.cargarPerfil();
				this.errorHandler.handleSuccess('¡Actualizado!', 'La persona ha sido actualizada correctamente.');
			}
		});
	}

	public cambiarPassword(): void {
		const dialogRef = this.dialog.open(CambiarPasswordComponent, {
			width: '400px',
			maxWidth: '60vw',
			disableClose: true,
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				Swal.fire({
					title: '¿Estás seguro?',
					text: '¿Deseas actualizar la contraseña?',
					icon: 'question',
					showCancelButton: true,
					confirmButtonText: 'Sí, guardar',
					cancelButtonText: 'Cancelar'
				}).then((swalResult) => {
					if (swalResult.isConfirmed) {

						if (!this.perfil || !this.perfil.ci) {
							this.errorHandler.handleError(null, 'No se encontró la persona o su CI.');
							return;
						}

						const ciNumber = typeof this.perfil.ci === 'number' ? this.perfil.ci : Number(this.perfil.ci);
						if (isNaN(ciNumber)) {
							this.errorHandler.handleError(null, 'El CI no es válido.');
							return;
						}

						const payload = {
							password_actual: result.currentPassword,
							nuevo_password: result.newPassword,
							confirmacion_password: result.confirmPassword
						};

						this.personaService.postChangePassword(ciNumber, payload).subscribe({
							next: (res) => this.errorHandler.handleSuccess(res.message || 'Contraseña cambiada correctamente.', '¡Éxito!'),
							error: (error) => this.errorHandler.handleError(error, 'No se pudo cambiar la contraseña.')
						});
					}
				});
			}
		});
	}

	public subirImagen(): void {
		if (!this.perfil || !this.perfil.ci) {
			this.errorHandler.handleError(null, 'No se encontró la persona o su CI.');
			return;
		}
		const perfil = this.perfil;

		const imagenActual = perfil?.imagen
			? (perfil.imagen.startsWith('data:') ? perfil.imagen : `data:image/jpeg;base64,${perfil.imagen}`)
			: '';

		this.dialog.open(SubirImagenComponent, {
			disableClose: true,
			width: '33vw',
			maxWidth: '33vw',
			data: { ci: this.perfil.ci, imagenActual: imagenActual }
		}).afterClosed().subscribe((result) => {
			if (result) {
				this.cargarPerfil();
				this.cdr.detectChanges();
				this.errorHandler.handleSuccess('¡Éxito!', 'Imagen actualizada correctamente.');
			}
		});
	}

}


