import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobPosts } from '../models/jobModel';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = 'http://localhost:8080/jobs';

  constructor(private http: HttpClient) {}

  postJob(job: JobPosts): Observable<JobPosts> {
    return this.http.post<JobPosts>(`${this.apiUrl}/post`, job,{ withCredentials: true });
  }

  getJobs(): Observable<JobPosts[]> {
    return this.http.get<JobPosts[]>(this.apiUrl);
  }
   getJobById(id: number): Observable<JobPosts> {
    return this.http.get<JobPosts>(`${this.apiUrl}/${id}`);
  }
}
