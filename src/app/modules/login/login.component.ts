import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from "@angular/material/dialog";
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { MaterialModule } from '../../shared/app.material';


@Component({
	selector: 'app-login',
	imports: [FormsModule, ReactiveFormsModule, CommonModule, MaterialModule],
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
					this.router.navigate(['/dashboard']);
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
