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

	public formPersona: FormGroup;
	public persona?: Persona;
	personaSubscriptor?: Subscription;

	public imagenPreview: string | null = null;
	public convertido: string | null = null;
	public isNavOpen: boolean = true;

	constructor(
		private rolesService: RolesService,
		private readonly personaService: PersonaService,
		private readonly fb: FormBuilder
	) {
		this.formPersona = new FormGroup({});
	}
	ngOnInit(): void {
		this.getMiPerfil();
	}

	ngOnDestroy(): void {
		this.personaSubscriptor?.unsubscribe();
	}

	tieneRol(rolId: number): boolean {
		return this.rolesService.hasRoleId(rolId);
	}

	tieneAlgunRol(roles: number[]): boolean {
		return roles.some(r => this.rolesService.hasRoleId(r));
	}


	public getMiPerfil(): void {
		this.personaSubscriptor = this.personaService.getPerfil().subscribe({
			next: (response) => {
				this.persona = {
					...response.data.persona,
					usuario: response.data.usuario,
					roles: response.data.roles
				};

				console.log('Perfil del usuario************:', response);

				if (this.persona?.imagen) {
					this.imagenPreview = 'data:image/png;base64,' + this.persona.imagen;
				} else {
					this.imagenPreview = null;
				}
			},
			error: () => {
				Swal.fire('Error', 'No se pudo cargar el perfil del usuario.', 'error');
			}
		});
	}

	toggleNav(): void {
		this.isNavOpen = !this.isNavOpen;
	}

}





