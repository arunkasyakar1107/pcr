import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcrReader } from './pcr-reader';

describe('PcrReader', () => {
  let component: PcrReader;
  let fixture: ComponentFixture<PcrReader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PcrReader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PcrReader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
