import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Groupbar } from './groupbar';

describe('Groupbar', () => {
  let component: Groupbar;
  let fixture: ComponentFixture<Groupbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Groupbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Groupbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
