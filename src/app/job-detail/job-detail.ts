import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../services/job.service';
import { JobPosts } from '../models/jobModel';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-job-details',
  standalone: true,
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    MatChipsModule,
    MatDividerModule,
    NgIf
  ]
})
export class JobDetail implements OnInit {
  job: JobPosts | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading = false;
      return;
    }

    this.jobService.getJobById(id).subscribe({
      next: (data) => {
        this.job = data;
        console.log("JOB DETAIL" + this.job.postedAt);
        this.loading = false;
      },
      error: () => {
        this.job = null;
        this.loading = false;
      }
    });
  }
}
