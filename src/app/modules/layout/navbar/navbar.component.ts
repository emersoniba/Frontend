import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { Persona, Rol } from '../../../models/auth.interface';
import { PersonaService } from '../../../services/persona.service';


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
		private readonly personaService: PersonaService,
	) { }

	ngOnInit(): void {
		this.cargarPerfil();
	}

	ngOnDestroy(): void {
		this.perfilSubscriptor?.unsubscribe();
	}
	
	tieneRol(rol: Rol): boolean {
		if (!this.perfil?.roles) return false;
		return this.perfil.roles.some(r => r.id === rol.id);
	}

	tieneAlgunRol(roles: number[]): boolean {
		if (!this.perfil?.roles) return false;
		return roles.some(r => this.perfil?.roles?.some(rol => rol.id === r));
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





