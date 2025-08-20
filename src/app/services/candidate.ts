import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from '@angular/core';
import { UserProfileModel } from '../models/userProfileModel';
import { environment } from '../../environments/environment.prod';
@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = `${environment.apiBaseUrl}`;

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
    return this.http.get<any[]>(`${this.apiUrl}/api/documents/user/${userId}`);
  }

  // ✅ Upload document
async uploadDocument(userId: number, file: File, documentType: string): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId.toString());
  formData.append('documentType', documentType);

  const response = await fetch(`${this.apiUrl}/api/documents/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status: ${response.status}`);
  }
}

  // ✅ Delete document
//   deleteDocument(documentId: number): Observable<any> {
//   console.log(`Deleting document with ID: ${documentId}`);
//   return this.http.delete<any>(`http://localhost:8080/api/documents/${documentId}`);
// }
  

deleteDocument(documentId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/api/documents/${documentId}`, {
    responseType: 'text' as const
  });
}

sendCandidateEmail(candidateId: number, data: any): Promise<void> {
  return this.http.post<void>(`${this.apiUrl}/user-profile/${candidateId}/send-email-complete`, data).toPromise();
}


}



