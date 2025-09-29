import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Applicant } from '../models/applicant';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ApplicantService {
  private apiUrl = `${environment.apiBaseUrl}/applicants`;

  constructor(private http: HttpClient) {}

  getApplicants(): Observable<Applicant[]> {
    return this.http.get<Applicant[]>(this.apiUrl);
  }

  getApplicant(id: number): Observable<Applicant> {
    return this.http.get<Applicant>(`${this.apiUrl}/${id}`);
  }

  createApplicant(applicant: Omit<Applicant, 'id'>): Observable<Applicant> {
    return this.http.post<Applicant>(this.apiUrl, applicant);
  }

  updateApplicant(id: number, applicant: Omit<Applicant, 'id'>): Observable<Applicant> {
    return this.http.put<Applicant>(`${this.apiUrl}/${id}`, applicant);
  }

  deleteApplicant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
