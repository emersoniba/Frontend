import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';

import Swal from 'sweetalert2';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { UsuarioFormDialogComponent } from './usuario-form-dialog/usuario-form-dialog.component';
import { CambiarPasswordComponent } from './cambiar-password/cambiar-password.component';
import { SubirImagenComponent } from './subir-imagen/subir-imagen.component';
import { PersonaService } from '../../../services/persona.service';
import { Persona } from '../../../models/auth.interface';

@Component({
	selector: 'app-perfile',
	standalone: true,
	imports: [
		MatIconModule,
		ReactiveFormsModule, MatGridListModule,
		CommonModule,
		MatDialogModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
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
	) {	}

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

				console.log(this.perfil);

				if (this.perfil?.imagen) {
					this.imagenPreview = 'data:image/png;base64,' + this.perfil.imagen;
				} else {
					this.imagenPreview = null;
				}
			},
			error: (error) => {
				console.error(error);
				Swal.fire('Error', 'No se pudo cargar el perfil.', 'error');
			}
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
				Swal.fire('¡Actualizado!', 'La persona ha sido actualizada correctamente.', 'success');
			}
		});
	}

	public cambiarPassword(): void {
		const dialogRef = this.dialog.open(CambiarPasswordComponent, {
			width: '400px',
			maxWidth: '60vw',//configurar para movils
			disableClose: true,
		}

		);

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				if (!this.perfil|| !this.perfil.ci) {
					Swal.fire('Error', 'No se encontró la persona o su CI.', 'error');
					return;
				}
				const ciNumber = typeof this.perfil.ci === 'number' ? this.perfil.ci : Number(this.perfil.ci);
				if (isNaN(ciNumber)) {
					Swal.fire('Error', 'El CI no es válido.', 'error');
					return;
				}
				const payload = {
					password_actual: result.currentPassword,
					nuevo_password: result.newPassword,
					confirmacion_password: result.confirmPassword
				};
				this.personaService.postChangePassword(ciNumber, payload).subscribe({
					next: (res) => {
						Swal.fire('¡Éxito!', res.message || 'Contraseña cambiada correctamente.', 'success');
					},
					error: (err) => {
						Swal.fire('Error', err.error?.message || 'No se pudo cambiar la contraseña.', 'error');
					}
				});
			}
		});
	}

	public subirImagen(): void {
		if (!this.perfil || !this.perfil.ci) {
			Swal.fire('Error', 'No se encontró la persona o su CI.', 'error');
			return;
		}
		this.dialog.open(SubirImagenComponent, {
			disableClose: true,
			width: '30vw',
			maxWidth: '30vw',
			data: { ci: this.perfil.ci }
		}).afterClosed().subscribe((result) => {
			if (result) {
				Swal.fire('¡Éxito!', 'Imagen actualizada correctamente.', 'success');
				this.cargarPerfil();
			}
		});
	}

}