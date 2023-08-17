import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Highcharts3dComponent } from './highcharts3d.component';

describe('Highcharts3dComponent', () => {
  let component: Highcharts3dComponent;
  let fixture: ComponentFixture<Highcharts3dComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Highcharts3dComponent]
    });
    fixture = TestBed.createComponent(Highcharts3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
