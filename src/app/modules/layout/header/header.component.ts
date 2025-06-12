import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Persona } from '../../../models/auth.interface';
import { PersonaService } from '../../../services/persona.service';

import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';


@Component({
	selector: 'app-header',
	standalone: true,
	imports: [MatButtonModule, MatMenuModule, NgbDropdownModule, CommonModule, MatIconModule, MatIcon],
	templateUrl: './header.component.html',
	styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {

	public perfil?: Persona;
	private perfilSubscriptor?: Subscription;
	public imagenPreview: string | null = null;
	public convertido: string | null = null;

	constructor(
		private readonly router: Router,
		private readonly personaService: PersonaService,
	) { }

	ngOnInit(): void {
		this.cargarPerfil();
	}

	ngondestroy(): void {
		if (this.perfilSubscriptor) {
			this.perfilSubscriptor.unsubscribe();
		}
	}

	public logout() {
		localStorage.removeItem('tkn-boletas');
		localStorage.removeItem('tkn-refresh');
		this.router.navigate(['/login']);
	}

	public PerfilUsuario() {
		this.router.navigateByUrl('/perfil');
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
}
