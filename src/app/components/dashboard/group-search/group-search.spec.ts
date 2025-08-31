import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSearch } from './group-search';

describe('GroupSearch', () => {
  let component: GroupSearch;
  let fixture: ComponentFixture<GroupSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
