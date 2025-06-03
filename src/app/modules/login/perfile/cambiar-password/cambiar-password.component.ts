import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, MatIconModule
  ],
  templateUrl: './cambiar-password.component.html',
  styleUrl: './cambiar-password.component.css'
})

export class CambiarPasswordComponent {


  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CambiarPasswordComponent>
  ) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  get passwordsNoCoinciden(): boolean {
    const newPass = this.form.get('newPassword')?.value;
    const confirmPass = this.form.get('confirmPassword')?.value;
    return newPass && confirmPass && newPass !== confirmPass;
  }

  onSubmit() {
    if (this.form.valid && !this.passwordsNoCoinciden) {
      const data = this.form.value;
      this.dialogRef.close(data);  
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }
 

}
