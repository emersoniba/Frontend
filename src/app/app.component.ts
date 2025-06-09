import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Rol } from './models/auth.interface';
import { AuthService } from './services/auth.service';
import { RolesService } from './services/roles.service';


@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
})


export class AppComponent implements OnInit {

	private readonly router = inject(Router);
	private readonly authService = inject(AuthService);
	private readonly rolesService = inject(RolesService);

	ngOnInit(): void {
		const token = localStorage.getItem('tkn-boletas');
		if (token) {
			this.authService.getCurrentUser().subscribe({
				next: (response) => {
					const user = response.data;
					const roles: Rol[] = user.roles;
					if (user.roles) {
						this.rolesService.setRoles(roles.map(r => r.nombre));
						this.rolesService.setRolesId(roles.map(r => r.id));
					}
				},
				error: (err) => {
					if (err.status === 401) {
						this.authService.logout();
					}
				}
			});
		} else {
			this.router.navigate(['/login']);
		}
	}

 }
