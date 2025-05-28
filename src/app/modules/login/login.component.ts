import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

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
        console.log(response);
        localStorage.setItem('tkn-boletas', response.access);
        localStorage.setItem('tkn-refresh', response.refresh);
        localStorage.setItem('user-roles', JSON.stringify(response.roles));
        localStorage.setItem('roles_id', JSON.stringify(response.roles_id));
        localStorage.setItem('user-fullname', response.nombre_completo);
        const decodedToken: any = jwtDecode(response.access);
        console.log('Token decodificado:', decodedToken);

        const expiraHasta = decodedToken.exp * 1000;
        const limite = Date.now();
        const tiempoFinaldeExpiracion = expiraHasta - limite;
        //const tiempoFinaldeExpiracion = 1*10*1000;
        if (tiempoFinaldeExpiracion > 0) {
          console.log(`Token expira en ${tiempoFinaldeExpiracion / 1000}s`);
          setTimeout(() => {
            Swal.fire({
              text: 'Tu sesión ha expirado. Favor, vuelva a iniciar sesión.',
              icon: 'warning',
              confirmButtonColor: '#3085d6',
            }).then(() => {
              localStorage.clear();
              this.router.navigate(['/login']);
            });

          }, tiempoFinaldeExpiracion);
          this.router.navigate(['/perfil']);
        } else {
          //para los ya expirados
          Swal.fire({
            text: 'Tu sesión ya expiró. Favor, vuelva a iniciar sesión.',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          }).then(() => {
            localStorage.clear();
            this.router.navigate(['/login']);
          });
        }

      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          text: err.error.detail || 'Error al iniciar sesión.',
          icon: 'error',
        });
      }
    });
  }

}