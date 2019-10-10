import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashMobComponent } from './flash-mob.component';

describe('FlashMobComponent', () => {
  let component: FlashMobComponent;
  let fixture: ComponentFixture<FlashMobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashMobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashMobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
