import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule} from '@angular/common';

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
    private loginService: LoginService,
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
    this.formLoginSubscriptor = this.loginService.login(this.formLogin.value).subscribe({
      next: (response) => {

        console.log(response);
        localStorage.setItem('tkn-boletas', response.access);
        localStorage.setItem('tkn-refresh', response.refresh);
        //*localStorage.removeItem('tkn-boletas')
        console.log(localStorage.getItem('tkn-boletas'));
        //*this.router.navigate(['/dashboard']);
      }, error: (err) => {
        console.log(err);
        console.log(err.error.detail);

        //toastr
        //sweetalert
      }
    });
  }

  ngOnDestroy(): void {
    this.formLoginSubscriptor?.unsubscribe();
  }
}