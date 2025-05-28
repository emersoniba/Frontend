import { Component, OnInit } from '@angular/core';
import { PersonaService } from '../../../services/persona.service';
import { Persona } from '../../../models/auth.interface';
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  persona!: Persona;

  constructor(
    private personaService: PersonaService,
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.personaService.getPersonaProfile().subscribe((data: Persona) => {
      this.persona = data;
    });
  }

}
