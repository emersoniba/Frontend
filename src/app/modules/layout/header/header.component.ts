import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/auth.interface';
import { Subscription } from 'rxjs';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, NgbDropdownModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  usuario: any = null;

  public dataUsuario: Usuario = {} as Usuario;
  private usuarioSubscriptor: Subscription | undefined;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getUserProfile();
  }

  public getUserProfile() {
    this.usuarioSubscriptor = this.authService.getProfile().subscribe({
      next: (response) => {
        this.dataUsuario = response;
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  logout() {
    localStorage.removeItem('tkn-boletas');
    localStorage.removeItem('tkn-refresh');
    this.router.navigate(['/login']);
  }
  PerfilUsuario() {
    this.router.navigateByUrl('/perfil');
  }

}


