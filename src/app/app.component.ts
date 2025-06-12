import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from './services/auth.service';


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

	ngOnInit(): void {
		const token = localStorage.getItem('tkn-boletas');
		if (token) {

			this.authService.getCurrentUser().subscribe({
				next: (response) => {
					const user = response.data;
				},

				error: (err) => {
					console.error('Error al recuperar usuario:', err);
					if (err.status === 401) {
						console.warn('Token inválido o expirado, cerrando sesión...');
						this.authService.logout();
					}
				}
			});
		} 
		else 
		{
			this.router.navigate(['/dashboard']);
		}
	}
}
