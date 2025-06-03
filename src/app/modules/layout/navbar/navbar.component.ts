import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RolesService } from '../../../services/roles.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  constructor(private rolesService: RolesService) {}

  ngOnInit(): void {
    
  }

  tieneRol(rolId: number): boolean {
    return this.rolesService.hasRoleId(rolId);
  }

  tieneAlgunRol(roles: number[]): boolean {
    return roles.some(r => this.rolesService.hasRoleId(r));
  }
}
