import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PersonaService } from '../../../services/persona.service';
import { Persona, Departamento } from '../../../models/auth.interface';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DepartamentoService } from '../../../services/departamento.service';
import { UsuarioFormDialogComponent } from './usuario-form-dialog/usuario-form-dialog.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { CambiarPasswordComponent } from './cambiar-password/cambiar-password.component';
import { SubirImagenComponent } from './subir-imagen/subir-imagen.component';

@Component({
  selector: 'app-perfile',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatGridListModule,
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './perfile.component.html',
  styleUrl: './perfile.component.css'
})



export class PerfileComponent implements OnInit, OnDestroy {

  public formPersona: FormGroup;
  public persona?: Persona;
  public dataDepartamento: Departamento[] = [];
  private personaSubscriptor?: Subscription;

  /*deseaq*/
  public imagenPreview: string | null = null;
  public convertido: string | null = null;

  constructor(
    private readonly personaService: PersonaService,
    private readonly departamentoService: DepartamentoService,
    private readonly dialog: MatDialog,
    private readonly fb: FormBuilder
  ) {
    this.formPersona = new FormGroup({});
  }

  ngOnInit(): void {
    this.getDepartamento();
    this.getMiPerfil();
  }

  ngOnDestroy(): void {
    this.personaSubscriptor?.unsubscribe();
  }

public getMiPerfil(): void {
  this.personaSubscriptor = this.personaService.getPerfil().subscribe({
    next: (response) => {
      this.persona = {
        ...response.persona,
        usuario: response.usuario,
        roles: response.roles
      };

      if (this.persona.imagen) {
        this.imagenPreview = 'data:image/png;base64,' + this.persona.imagen;
      } else {
        this.imagenPreview = null; 
      }
    },
    error: () => {
      Swal.fire('Error', 'No se pudo cargar el perfil del usuario.', 'error');
    }
  });
}

  public getDepartamento(): void {
    this.departamentoService.getDepartamentos().subscribe({
      next: (response: Departamento[]) => {
        this.dataDepartamento = response;
      },
      error: (err: unknown) => console.error(err)
    });
  }

  public editar(): void {
    if (!this.persona) return;
    this.dialog.open(UsuarioFormDialogComponent, {
      width: '40vw',
      maxWidth: '60vw',
      disableClose: true,
      data: {
        departamentos: this.dataDepartamento,
        persona: this.persona
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.getMiPerfil();
        Swal.fire('¡Actualizado!', 'La persona ha sido actualizada correctamente.', 'success');
      }
    });
  }

  public cambiarPassword(): void {
    const dialogRef = this.dialog.open(CambiarPasswordComponent, {
      width: '400px',
      maxWidth: '60vw',//configurar para movils
      disableClose: true,
    }

    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!this.persona || !this.persona.ci) {
          Swal.fire('Error', 'No se encontró la persona o su CI.', 'error');
          return;
        }
        const ciNumber = typeof this.persona.ci === 'number' ? this.persona.ci : Number(this.persona.ci);
        if (isNaN(ciNumber)) {
          Swal.fire('Error', 'El CI no es válido.', 'error');
          return;
        }
        const payload = {
          password_actual: result.currentPassword,
          nuevo_password: result.newPassword,
          confirmacion_password: result.confirmPassword
        };
        this.personaService.postChangePassword(ciNumber, payload).subscribe({
          next: (res) => {
            Swal.fire('¡Éxito!', res.message || 'Contraseña cambiada correctamente.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'No se pudo cambiar la contraseña.', 'error');
          }
        });
      }
    });
  }

  public subirImagen(): void {
    if (!this.persona || !this.persona.ci) {
      Swal.fire('Error', 'No se encontró la persona o su CI.', 'error');
      return;
    }
    this.dialog.open(SubirImagenComponent, {
      disableClose: true,
      width: '30vw',
      maxWidth: '30vw',
      data: { ci: this.persona.ci }
    }).afterClosed().subscribe((result) => {
      if (result) {
        Swal.fire('¡Éxito!', 'Imagen actualizada correctamente.', 'success');
        this.getMiPerfil(); 
      }
    });
  }

}
