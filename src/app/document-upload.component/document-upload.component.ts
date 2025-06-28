import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Required!
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // <-- Add FormsModule here
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent {
  selectedFile: File | null = null;
  userId: number = 0;
  message = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadDocument() {
    if (!this.selectedFile || !this.userId) {
      this.message = 'User ID and document are required.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('userId', this.userId.toString());

    this.http.post('http://localhost:8080/api/documents/upload', formData)
      .subscribe({
        next: () => this.message = 'Upload successful!',
        error: err => this.message = 'Upload failed: ' + err.message
      });
  }
}
