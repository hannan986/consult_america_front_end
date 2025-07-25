
import { Component } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resume-upload',
  imports: [CommonModule,FormsModule],
  templateUrl: './resume-upload.html',
  styleUrl: './resume-upload.scss',
  standalone: true
})
export class ResumeUpload {
  formData: any = {
    name: '',
    email: '',
    contact: '',
    summary: '',
    file: null as File | null
  };

  uploadProgress: number | null = null;
  message: string = '';

  constructor(private http: HttpClient) {}

   onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.formData.resumeFile = input.files[0];
    }
  }

  onSubmit() {
    console.log("FORMDATA = " ,this.formData);
    if (!this.formData.resumeFile || !this.formData.name) {
      this.message = 'Name and file are required!';
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', this.formData.resumeFile as File);
    uploadData.append('name', this.formData.name);
    if (this.formData.email) uploadData.append('email', this.formData.email);
    if (this.formData.contact) uploadData.append('contact', this.formData.contact);
    if (this.formData.summary) uploadData.append('summary', this.formData.summary);

    this.http.post('http://localhost:8080/admin/upload', uploadData, {
      reportProgress: true,
      withCredentials: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.message = 'Upload successful!';
          this.uploadProgress = null;
        }
      },
      error: (err) => {
        this.message = 'Upload failed: ' + (err.error?.message || err.message);
        this.uploadProgress = null;
      }
    });
  }
  
}
