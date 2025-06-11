import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RolesService } from '../../../services/roles.service';
import { PersonaService } from '../../../services/persona.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Persona } from '../../../models/auth.interface';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
@Component({
	selector: 'app-navbar',
	imports: [RouterLink, CommonModule, MatIconModule, MatIcon, MatTooltip],
	standalone: true,
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

	public isNavOpen: boolean = true;

	public perfil?: Persona;
	private perfilSubscriptor?: Subscription;
	public imagenPreview: string | null = null;
	public convertido: string | null = null;

	constructor(
		private rolesService: RolesService,
		private readonly personaService: PersonaService,
		private readonly fb: FormBuilder
	) { }

	ngOnInit(): void {
		this.cargarPerfil();
	}

	ngOnDestroy(): void {
		this.perfilSubscriptor?.unsubscribe();
	}

	tieneRol(rolId: number): boolean {
		return this.rolesService.hasRoleId(rolId);
	}

	tieneAlgunRol(roles: number[]): boolean {
		return roles.some(r => this.rolesService.hasRoleId(r));
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
			error: (error) => {
				console.error(error);
				Swal.fire('Error', 'No se pudo cargar el perfil.', 'error');
			}
		});
	}

	toggleNav(): void {
		this.isNavOpen = !this.isNavOpen;
	}

}





