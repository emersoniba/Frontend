import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

import { MaterialModule } from '../../../../shared/app.material';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  templateUrl: './cambiar-password.component.html',
  styleUrls: ['./cambiar-password.component.css']
})

export class CambiarPasswordComponent {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CambiarPasswordComponent>
  ) {
    this.form = this.fb.group(
      {
        contraseniaActual: ['', [Validators.required]],
        nuevaContrasenia: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),],],
        confirmarContrasenia: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),],],
      },
      {
        validators: [this.CoincideContrasenia()],
      }
    );
  }

  private CoincideContrasenia() {
    return (group: FormGroup) => {
      const nuevaContrasenia = group.get('nuevaContrasenia')?.value;
      const confirmarContrasenia = group.get('confirmarContrasenia')?.value;
      if (nuevaContrasenia && confirmarContrasenia && nuevaContrasenia !== confirmarContrasenia) {
        return { passwordsMismatch: true };
      }
      return null;
    };
  }

  get contraseniaActual() {
    return this.form.get('contraseniaActual');
  }
  get nuevaContrasenia() {
    return this.form.get('nuevaContrasenia');
  }
  get confirmarContrasenia() {
    return this.form.get('confirmarContrasenia');
  }

  get passwordsNoCoinciden(): boolean {
    return this.form.hasError('passwordsMismatch') &&
      this.confirmarContrasenia?.touched === true;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data = this.form.value;
    this.dialogRef.close(data);
  }

  cancelar() {
    this.dialogRef.close(null);
  }

}
