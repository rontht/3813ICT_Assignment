import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Channelbar } from './channelbar';

describe('Channelbar', () => {
  let component: Channelbar;
  let fixture: ComponentFixture<Channelbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Channelbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Channelbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
