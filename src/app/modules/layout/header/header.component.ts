import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/auth.interface';
import { Subscription } from 'rxjs';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RolesService } from '../../../services/roles.service';
import { PersonaService } from '../../../services/persona.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Persona } from '../../../models/auth.interface';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatIcon } from '@angular/material/icon';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [MatButtonModule, MatMenuModule, NgbDropdownModule, CommonModule, MatIconModule, MatIcon],
	templateUrl: './header.component.html',
	styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
	usuario: any = null;

	public dataUsuario: Usuario = {} as Usuario;
	private usuarioSubscriptor: Subscription | undefined;


	public formPersona: FormGroup;
	public persona?: Persona;
	personaSubscriptor?: Subscription;

	public imagenPreview: string | null = null;
	public convertido: string | null = null;

	constructor(
		private readonly router: Router,
		private readonly authService: AuthService,
		private rolesService: RolesService,
		private readonly personaService: PersonaService,
		private readonly fb: FormBuilder
	) {
		this.formPersona = new FormGroup({});
	}

	ngOnInit(): void {
		this.getMiPerfil();
	}

	public logout() {
		localStorage.removeItem('tkn-boletas');
		localStorage.removeItem('tkn-refresh');
		this.router.navigate(['/login']);
	}

	public PerfilUsuario() {
		this.router.navigateByUrl('/perfil');
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


}
