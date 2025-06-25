import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from '@angular/core';
import { UserProfileModel } from '../models/userProfileModel';
@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = 'http://localhost:8080/admin';

  constructor(private http: HttpClient) {}

  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidates`);
  }

  getCandidate(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getResumesByEmail(email: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/email/${email}`);
}

 
}

