import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPost } from './job-post';

describe('JobPost', () => {
  let component: JobPost;
  let fixture: ComponentFixture<JobPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobPost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
