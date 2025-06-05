import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { PersonaService } from '../../../../services/persona.service';
import { Persona, Rol } from '../../../../models/auth.interface';
import { MaterialModule } from '../../../../shared/app.material';


@Component({
	selector: 'app-roles-form-dialog',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MaterialModule,
	],
	templateUrl: './roles-form-dialog.component.html',
	styleUrl: './roles-form-dialog.component.css',
})
export class RolesFormDialogComponent implements OnInit {

	form!: FormGroup;
	rolesFiltradosList: Rol[] = [];
	rolesDisponibles: Rol[] = [];
	rolFiltroControl = new FormControl('');

	constructor(
		private dialogRef: MatDialogRef<RolesFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: Persona,
		private fb: FormBuilder,
		private personaService: PersonaService
	) { }

	ngOnInit(): void {
		console.log(this.data);
		this.form = this.fb.group({
			roles: [[], [Validators.required, Validators.minLength(1)]],
		});

		this.personaService.getRoles().subscribe((rolesDisponibles) => {
			this.rolesDisponibles = rolesDisponibles ?? [] as Rol[];
			this.rolesFiltradosList = [...this.rolesDisponibles];
			const idsAsignados = (this.data.roles ?? []).map((r: Rol) => r.id);
			this.form.patchValue({ roles: idsAsignados });
			this.rolFiltroControl.valueChanges.subscribe((filtro: string | null) => {
				const valor = (filtro ?? '').toLowerCase();
				this.rolesFiltradosList = this.rolesDisponibles.filter((rol) =>
					rol.nombre.toLowerCase().includes(valor)
				);
			});
		});
	}

	submit() {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const rolesSeleccionados: number[] = this.form.value.roles;

		this.personaService.postEditarRolPersona(this.data.ci, { roles: rolesSeleccionados })
			.subscribe({
				next: (response) => {
					Swal.fire('Éxito', `Roles actualizados para ${response.username}`, 'success');
					this.dialogRef.close('success');
				},
				error: (err) => {
					const msg = err?.error?.message || 'Error al asignar roles';
					Swal.fire('Error', msg, 'error');
				}
			});
	}

	cancelar() {
		this.dialogRef.close();
	}
}
