import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletaDetalleModalComponent } from './boleta-detalle-modal.component';

describe('BoletaDetalleModalComponent', () => {
  let component: BoletaDetalleModalComponent;
  let fixture: ComponentFixture<BoletaDetalleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletaDetalleModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletaDetalleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
