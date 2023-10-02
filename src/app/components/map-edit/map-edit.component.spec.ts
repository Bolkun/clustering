import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapEditComponent } from './map-edit.component';

describe('MapEditComponent', () => {
  let component: MapEditComponent;
  let fixture: ComponentFixture<MapEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapEditComponent]
    });
    fixture = TestBed.createComponent(MapEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
