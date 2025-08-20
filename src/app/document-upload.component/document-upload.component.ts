import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Required!
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // <-- Add FormsModule here
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit {
  selectedFile: File | null = null;
  userId: number = 0;
  message = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const savedUserId = localStorage.getItem('documentUpload_userId');
    const savedMessage = localStorage.getItem('documentUpload_message');
    if (savedUserId) {
      this.userId = Number(savedUserId);
    }
    if (savedMessage) {
      this.message = savedMessage;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    // File objects cannot be persisted for security reasons
  }

  uploadDocument() {
    if (!this.selectedFile || !this.userId) {
      this.message = 'User ID and document are required.';
      localStorage.setItem('documentUpload_message', this.message);
      localStorage.setItem('documentUpload_userId', this.userId.toString());
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('userId', this.userId.toString());
    const url = `${environment.apiBaseUrl}/api/documents/upload`;
    this.http.post(url, formData)
      .subscribe({
        next: () => {
          this.message = 'Upload successful!';
          localStorage.setItem('documentUpload_message', this.message);
          localStorage.setItem('documentUpload_userId', this.userId.toString());
        },
        error: err => {
          this.message = 'Upload failed: ' + err.message;
          localStorage.setItem('documentUpload_message', this.message);
          localStorage.setItem('documentUpload_userId', this.userId.toString());
        }
      });
  }
}
