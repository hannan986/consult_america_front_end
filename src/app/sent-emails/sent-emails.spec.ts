import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentEmails } from './sent-emails';

describe('SentEmails', () => {
  let component: SentEmails;
  let fixture: ComponentFixture<SentEmails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentEmails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentEmails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
