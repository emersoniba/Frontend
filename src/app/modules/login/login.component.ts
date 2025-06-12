import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { MatDialog } from "@angular/material/dialog";
import { RolesService } from '../../services/roles.service';
@Component({
	selector: 'app-login',
	imports: [FormsModule, ReactiveFormsModule, CommonModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

	private formLoginSubscriptor: Subscription | undefined;
	public formLogin: FormGroup;
	public dataDepartamentos: any[] = [];
	constructor(
		private authService: AuthService,
		private fb: FormBuilder,
		private router: Router,
		private dialog: MatDialog,
		private rolesService: RolesService,
	) {
		this.formLogin = new FormGroup({});
	}

	public ngOnInit(): void {
		this.getFormBuilder();
	}

	public getFormBuilder() {
		this.formLogin = this.fb.group({
			username: ['', [Validators.required,]],
			password: ['', [Validators.required,]],
		});
	}

	public ngOnDestroy(): void {
		this.formLoginSubscriptor?.unsubscribe();
	}

	public onActionClickLogin() {
		this.formLoginSubscriptor = this.authService.login(this.formLogin.value).subscribe({
			next: (response) => {
				localStorage.setItem('tkn-boletas', response.access);
				localStorage.setItem('tkn-refresh', response.refresh);

				this.authService.getPerfil().subscribe((usuario) => {
					this.rolesService.setRoles(response.roles);
					this.rolesService.setRolesId(response.roles_id);
					this.rolesService.setFullName(response.nombre_completo);
					this.router.navigate(['/perfil']);
				});
			},
			error: (err) => {
				Swal.fire({
					text: err.error.detail || 'Error al iniciar sesión.',
					icon: 'error',
				});
			}
		});


	}
}
