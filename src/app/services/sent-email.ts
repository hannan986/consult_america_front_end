import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SentEmail {
  resumeId: string;
  candidateName?: string;
  candidateEmail?: string;
  recipientEmail: string;
  subject: string;
  message: string;
  date: Date;
  position?: string; // job title/position submitted to
  resumeSummary?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SentEmailService {
    private apiUrl = `${environment.apiBaseUrl}/resumes/api/sent-emails`;
  private sentEmails: SentEmail[] = [];
//  private apiBase = '/api/sent-emails';

  constructor(private http: HttpClient) {}

  // Add locally and attempt to persist on the server
  addEmail(email: SentEmail): void {
    //this.sentEmails.push(email);
    this.saveEmail(email).subscribe({
      next: (saved) => {
        // Optionally reconcile local copy with server response
        // console.log('Saved sent email on server', saved);
      },
      error: (err) => {
        console.warn('Failed to persist sent email to server', err);
      }
    });
  }

  // Persist a sent email to the backend database
  saveEmail(email: SentEmail): Observable<any> {
    console.log('API URL:', email);
    return this.http.post(this.apiUrl, email,{ withCredentials: true });
  }

  // Load latest sent emails from server and replace local cache
  async loadFromServer(): Promise<void> {
    try {
      const data = await this.http.get<SentEmail[]>(this.apiUrl,{withCredentials:true}).toPromise();
      this.sentEmails = data || [];
    } catch (err) {
      console.error('Failed to load sent emails from server', err);
    }
  }

  // Get local cache
  getEmails(): SentEmail[] {
    return this.sentEmails;
  }

  // Clear local cache and optionally clear server data
  clearEmails(): void {
    this.sentEmails = [];
    // best-effort server clear (optional)
    this.http.delete(this.apiUrl, { withCredentials: true }).subscribe({
      next: () => {},
      error: (err) => console.warn('Failed to clear server-side sent emails', err)
    });
  }
}
