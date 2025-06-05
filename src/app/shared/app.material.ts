import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';

const materialModules = [
	MatCardModule,
	MatButtonModule,
	MatIconModule,
	MatToolbarModule,
	MatTooltipModule,
	MatInputModule,
	ReactiveFormsModule,
	MatFormFieldModule,
	MatTableModule,
	MatDialogModule,
	MatSelectModule,
	MatSnackBarModule,
	MatProgressSpinnerModule,
	MatDatepickerModule,
	MatNativeDateModule,
	NgxMatSelectSearchModule,
];

@NgModule({
	imports: materialModules,
	exports: materialModules
})
export class MaterialModule { }
