import { Component, OnInit } from '@angular/core';
import { JobPosts } from '../models/jobModel';
import { JobService } from '../services/job.service';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
//import { JobDetailsDialogComponent } from './job-details-dialog.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    NgFor,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss'
})
export class JobList implements OnInit {
  jobs: JobPosts[] = [];
  filteredJobs: JobPosts[] = [];
  loading = true;
  searchTerm = '';

  constructor(
    private jobService: JobService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getJobs().subscribe({
      next: (list) => {
        this.jobs = list;
        this.filteredJobs = [...this.jobs];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.loading = false;
      }
    });
  }

  filterJobs(): void {
    if (!this.searchTerm) {
      this.filteredJobs = [...this.jobs];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredJobs = this.jobs.filter(job => 
      job.title.toLowerCase().includes(term) ||
      (job.description && job.description.toLowerCase().includes(term)) ||
      (job.location && job.location.toLowerCase().includes(term)) ||
      (job.type && job.type.toLowerCase().includes(term))
    );
  }

  getJobTypeClass(jobType: string | undefined): string {
    if (!jobType) return '';
    const type = jobType.toLowerCase();
    if (type.includes('full')) return 'full-time';
    if (type.includes('part')) return 'part-time';
    if (type.includes('contract')) return 'contract';
    if (type.includes('remote')) return 'remote';
    return '';
  }

  getJobTypeIcon(jobType: string | undefined): string {
    if (!jobType) return 'work_outline';
    const type = jobType.toLowerCase();
    if (type.includes('full')) return 'work';
    if (type.includes('part')) return 'schedule';
    if (type.includes('contract')) return 'assignment';
    if (type.includes('remote')) return 'public';
    return 'work_outline';
  }

  // openJobDetails(job: JobPosts): void {
  //   this.dialog.open(JobDetailsDialogComponent, {
  //     width: '800px',
  //     data: { job },
  //     panelClass: 'job-details-dialog'
  //   });
  // }

  reloadJobs(): void {
    this.loadJobs();
  }
}