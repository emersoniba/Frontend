import { Component, OnInit } from '@angular/core';
import { PrincipalService } from '../../../services/principal.service';

///***import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
/**export class HeaderComponent {
constructor(private readonly router: Router) {}

  logout() {
    localStorage.removeItem('tkn-boletas');
    localStorage.removeItem('tkn-refresh');
    this.router.navigate(['/login']);
  }
} */  

export class HeaderComponent implements OnInit {
  usuario: any = null;

  constructor(private principalService: PrincipalService) {}

  ngOnInit(): void {
    this.principalService.getDatosUsuario().subscribe({
      next: (res) => this.usuario = res,
      error: (err) => console.error('Error al obtener datos del usuario:', err)
    });
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
  /*logout() {
    localStorage.removeItem('tkn-boletas');
    localStorage.removeItem('tkn-refresh');
    this.router.navigate(['/login']);
  }*/
}

