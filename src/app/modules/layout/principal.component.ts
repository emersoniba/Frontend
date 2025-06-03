import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { NavbarComponent } from "./navbar/navbar.component";
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';



@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css',
  imports: [RouterOutlet, NavbarComponent, HeaderComponent, FooterComponent]
})
export class PrincipalComponent implements OnInit {

  public user: any;


  constructor(private readonly authService: AuthService) { }

  rolesUsuario: string[] = [];

  ngOnInit(): void {
    const token = localStorage.getItem('tkn-boletas');
    if (token) {
      const decoded: any = jwtDecode(token);
      
    }
  }
}

