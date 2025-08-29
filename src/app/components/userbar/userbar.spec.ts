import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userbar } from './userbar';

describe('Userbar', () => {
  let component: Userbar;
  let fixture: ComponentFixture<Userbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
