import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Proyecto } from '../../../../services/proyecto.service';
import { EntidadService } from '../../../../services/entidad.service';
import { DepartamentoService } from '../../../../services/departamento.service';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Entidad } from '../../../../models/proyecto.model';


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './proyecto-modal.component.html',
  encapsulation: ViewEncapsulation.None,

  styleUrls: ['./proyecto-modal.component.css']
})
export class ProyectoModalComponent implements OnInit, OnDestroy, AfterViewInit {
  proyectoForm: FormGroup;
  entidades: any[] = [];
  departamentos: any[] = [];
  isEditMode: boolean = false;
  entidadControl = new FormControl('');
  entidadesFiltradas!: Observable<Entidad[]>;

  constructor(
    private fb: FormBuilder,
    private entidadService: EntidadService,
    private departamentoService: DepartamentoService,
    public dialogRef: MatDialogRef<ProyectoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proyecto: Proyecto | null }
  ) {
    this.proyectoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      entidad_id: [1, Validators.required],
      departamento_id: [1, Validators.required],
      fecha_creado: [new Date(), Validators.required],
      fecha_finalizacion: [new Date(), Validators.required]
    });
  }

   ngOnInit(): void {
    this.cargarEntidades();
    this.cargarDepartamentos();

    if (this.data.proyecto) {
      this.isEditMode = true;
      this.proyectoForm.patchValue({
        ...this.data.proyecto,
        fecha_creado: new Date(this.data.proyecto.fecha_creado),
        fecha_finalizacion: new Date(this.data.proyecto.fecha_finalizacion)
      });
    }
  }

  cargarEntidades(): void {
    this.entidadService.getEntidades().subscribe({
      next: (data) => this.entidades = data,
      error: (err) => console.error('Error cargando entidades:', err)
    });
  }

  cargarDepartamentos(): void {
    this.departamentoService.getDepartamentos().subscribe({
      next: (data) => this.departamentos = data,
      error: (err) => console.error('Error cargando departamentos:', err)
    });
  }
  private _filtrarEntidades(valor: string): any[] {
    const filtro = valor?.toLowerCase() || '';
    if (!filtro.trim()) {
      return this.entidades;
    }
    return this.entidades.filter(entidad =>
      entidad.denominacion.toLowerCase().includes(filtro)
    );
  }


  onEntidadSelected(event: MatAutocompleteSelectedEvent): void {
    const entidad = this.entidades.find(e => e.denominacion === event.option.value);
    if (entidad) {
      this.proyectoForm.get('entidad_id')?.setValue(entidad.id);
    }
  }
  ngOnDestroy(): void {
    
  }
  ngAfterViewInit(): void {
    
  }
  


  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.proyectoForm.invalid) return;

    const action = this.isEditMode ? 'actualizar' : 'crear';
    const actionTitle = this.isEditMode ? 'Actualizar' : 'Crear';

    Swal.fire({
      title: `¿Estás seguro de ${action} el proyecto?`,
      text: this.isEditMode ?
        'Se modificará la información del proyecto.' :
        'Se creará un nuevo proyecto.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sí, ${actionTitle}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const proyectoData = {
          ...this.proyectoForm.value,
          fecha_creado: this.proyectoForm.value.fecha_creado.toISOString().split('T')[0],
          fecha_finalizacion: this.proyectoForm.value.fecha_finalizacion.toISOString().split('T')[0],
          creado_por_id: 1
        };

        this.dialogRef.close(proyectoData);

        Swal.fire(
          '¡Éxito!',
          `El proyecto ha sido ${action === 'crear' ? 'creado' : 'actualizado'} correctamente.`,
          'success'
        );
      }
    });
  }
}