import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Validators } from '@angular/forms';
import { Rol } from '../../../../models/auth.interface';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';


@Component({
	selector: 'app-usuario-form-dialog',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		NgxMatSelectSearchModule,
	],
	templateUrl: './usuario-form-dialog.component.html',
	styleUrl: './usuario-form-dialog.component.css',
})
export class UsuarioFormDialogComponent implements OnInit {
	form!: FormGroup;
	filtroRol: string = '';
	rolesFiltradosList: Rol[] = [];

	constructor(
		private dialogRef: MatDialogRef<UsuarioFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: {
			rolesDisponibles: Rol[];
		},
		private fb: FormBuilder
	) { }

	rolFiltroControl = new FormControl('');

	ngOnInit(): void {
		this.form = this.fb.group({
			roles: ['', [Validators.required, Validators.minLength(1)]]
		});
		this.rolesFiltradosList = this.data.rolesDisponibles;
		this.rolFiltroControl.valueChanges.subscribe((filtro: string | null) => {
			const valor = (filtro ?? '').toLowerCase();
			this.rolesFiltradosList = this.data.rolesDisponibles.filter((rol: any) =>
				rol.nombre.toLowerCase().includes(valor)
			);
		});
	}

	submit() {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}
		this.dialogRef.close(this.form.value);
	}

	cancelar() {
		this.dialogRef.close();
	}
}
