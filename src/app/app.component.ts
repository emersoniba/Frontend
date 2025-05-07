import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
 /**nuevo  */

import { PrincipalComponent } from './modules/layout/principal/principal.component';  
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, PrincipalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Frontend';
}