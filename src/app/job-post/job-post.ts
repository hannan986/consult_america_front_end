import { Component } from '@angular/core';
import { JobService } from '../services/job.service';
import { JobPosts } from '../models/jobModel';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-job-post',
  imports: [DatePipe, NgIf, NgFor, FormsModule],
  templateUrl: './job-post.html',
  styleUrl: './job-post.scss'
})

export class JobPost {
  job: JobPosts = {
    title: '',
    description: '',
    location: '',
    employmentType: '',
    technologyStack: '',
    clientName: '',
    contactEmail: '',
    postedAt:''
  };
  submitting = false;
  message = '';

  constructor(private jobService: JobService) {}

  submitJob(): void {
    if (!this.job.title || !this.job.contactEmail) {
      this.message = 'Title and contact email are required.';
      return;
    }
    this.submitting = true;
    this.jobService.postJob(this.job).subscribe({
      next: () => {
        this.message = 'Job posted successfully!';
        this.submitting = false;
        this.job = { title: '', description: '', location: '', employmentType: '', technologyStack: '', clientName: '', contactEmail: '',postedAt:'' };
      },
      error: err => {
        this.message = 'Failed to post job.';
        this.submitting = false;
      }
    });
  }
}
