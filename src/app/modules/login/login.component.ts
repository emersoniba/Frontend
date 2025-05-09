import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule} from '@angular/common';
import { jwtDecode } from 'jwt-decode';

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
  ){
    this.formLogin = new FormGroup({});
  }

  ngOnInit(): void {
    this.getFormBuilder();
  }

  public getFormBuilder(){
    this.formLogin = this.fb.group({
      username: ['', [Validators.required, ]],
      password: ['', [Validators.required, ]],
    });
  }


  public onActionClickLogin(){
    this.formLoginSubscriptor = this.authService.login(this.formLogin.value).subscribe({
      next: (response) => {
        console.log(response);
        localStorage.setItem('tkn-boletas', response.access);
        localStorage.setItem('tkn-refresh', response.refresh);
        const decodedToken: any = jwtDecode(response.access);
        console.log('Token decodificado:', decodedToken);
        this.router.navigate(['/persona']);
      }, 
      error: (err) => {
        console.log(err);
        console.log(err.error.detail);
      }
    });
  }

  ngOnDestroy(): void {
    this.formLoginSubscriptor?.unsubscribe();
  }
}