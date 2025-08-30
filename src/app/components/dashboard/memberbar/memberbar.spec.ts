import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Memberbar } from './memberbar';

describe('Memberbar', () => {
  let component: Memberbar;
  let fixture: ComponentFixture<Memberbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Memberbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Memberbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
