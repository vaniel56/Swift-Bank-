import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paybills } from './paybills';

describe('Paybills', () => {
  let component: Paybills;
  let fixture: ComponentFixture<Paybills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paybills],
    }).compileComponents();

    fixture = TestBed.createComponent(Paybills);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
