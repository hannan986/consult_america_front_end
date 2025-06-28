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
    return this.http.get<any>(`${this.apiUrl}/candidates/${id}`);
  }

  getResumesByEmail(email: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/email/${email}`);
}

 // ✅ Get documents by user ID
  getDocumentsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/documents/user/${userId}`);
  }

  // ✅ Upload document
 uploadDocument(userId: number, file: File, documentType: string): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId.toString());
  formData.append('documentType', documentType);

  return this.http.post<any>('http://localhost:8080/api/documents/upload', formData);
}

  // ✅ Delete document
  deleteDocument(documentId: number): Observable<any> {
  console.log(`Deleting document with ID: ${documentId}`);
  return this.http.delete<any>(`http://localhost:8080/api/documents/${documentId}`);
}
  
}

