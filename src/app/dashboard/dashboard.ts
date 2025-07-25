import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import Toastify from 'toastify-js';
import { DatePipe, NgIf, NgFor } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
   providers: [DatePipe],
   imports: [DatePipe, NgIf, NgFor, FormsModule],
})
export class Dashboard implements OnInit {
  API_BASE = "http://localhost:8080/resumes";
  currentResumes: any[] = [];
  uploadForm: FormGroup;
  stats = {
    totalResumes: 0,
    weeklyUploads: 0
  };
  selectedTags: string[] = [];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.uploadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      summary: [''],
      resumeFile: [null, Validators.required]
    });
  }
searchTerm = '';
searchDebounceTimer: any;

onSearchInput(): void {
  // Debounce search to avoid excessive calls
  clearTimeout(this.searchDebounceTimer);
  this.searchDebounceTimer = setTimeout(() => {
    this.filterResumes(this.searchTerm);
  }, 300);
}
onSearchEnter(): void {
  clearTimeout(this.searchDebounceTimer);
  this.filterResumes(this.searchTerm);
}
  ngOnInit(): void {
    this.initializeApplication();
  }
  clearSearch(): void {
  this.searchTerm = '';
  this.loadResumes();
}

  initializeApplication(): void {
    this.loadResumes();
  //  this.loadStats();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadForm.patchValue({ resumeFile: file });
    }
  }

  handleResumeUpload(): void {
    if (!this.validateUploadForm()) return;

    const formData = new FormData();
    formData.append('file', this.uploadForm.get('resumeFile')?.value);
    formData.append('name', this.uploadForm.get('name')?.value);
    formData.append('email', this.uploadForm.get('email')?.value);
    formData.append('contact', this.uploadForm.get('contact')?.value);
    formData.append('summary', this.uploadForm.get('summary')?.value);

    this.showLoading(true, 'upload');

    this.http.post(`${this.API_BASE}/upload`, formData).subscribe({
      next: (response: any) => {
        this.loadResumes();
        // this.loadStats();
        this.showToast('Resume uploaded successfully!', 'success');
        this.uploadForm.reset();
      },
      error: (error) => {
        const errorMsg = error.error?.message || error.statusText || 'Upload failed. Please try again.';
        this.showToast(`Error: ${errorMsg}`, 'error');
      },
      complete: () => {
        this.showLoading(false, 'upload');
      }
    });
  }

  validateUploadForm(): boolean {
    if (this.uploadForm.invalid) {
      this.showToast('Please fill all required fields', 'warning');
      return false;
    }

    const file = this.uploadForm.get('resumeFile')?.value;
    if (!file) {
      this.showToast('Please select a resume file', 'warning');
      return false;
    }

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type)) {
      this.showToast('Only PDF and DOCX files are allowed', 'warning');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('File size must be less than 5MB', 'warning');
      return false;
    }

    return true;
  }

  loadResumes(): void {
    this.showLoading(true, 'table');
    this.http.get(this.API_BASE, {withCredentials: true}).subscribe({
      next: (resumes: any) => {
        this.currentResumes = Array.isArray(resumes?.content) ? resumes.content : [];
        //this.loadStats();
      },
      error: () => {
       // this.showToast('Failed to load resumes. Please try again.', 'error');
      },
      complete: () => {
        this.showLoading(false, 'table');
      }
    });
  }

  // loadResumes(): void {
  //   this.showLoading(true, 'table');
  //   this.http.get(this.API_BASE).subscribe({
  //     next: (resumes: any) => {
  //       this.currentResumes = Array.isArray(resumes?.content) ? resumes.content : [];
  //       //this.loadStats();
  //     },
  //     error: () => {
  //       this.showToast('Failed to load resumes. Please try again.', 'error');
  //     },
  //     complete: () => {
  //       this.showLoading(false, 'table');
  //     }
  //   });
  // }

  // loadStats(): void {
  //   this.http.get(`${this.API_BASE}/stats`).subscribe({
  //     next: (data: any) => {
  //       this.stats = {
  //         totalResumes: data.totalResumes || 0,
  //         weeklyUploads: data.weeklyUploads || 0
  //       };
  //     },
  //     error: (err) => {
  //       console.error('Failed to load stats:', err);
  //     }
  //   });
  // }
handleSearchInput(event: Event): void {
  const searchTerm = (event.target as HTMLInputElement).value;
  this.filterResumes(searchTerm);
}

  filterResumes(searchTerm: string): void {
    if (!searchTerm) {
      this.loadResumes();
      return;
    }

    const term = searchTerm.toLowerCase();
    this.currentResumes = this.currentResumes.filter(resume => {
      return (
        (resume.name && resume.name.toLowerCase().includes(term)) ||
        (resume.email && resume.email.toLowerCase().includes(term)) ||
        (resume.tags && resume.tags.some((tag: string) => tag.toLowerCase().includes(term)))
      );
    });
  }

  downloadResume(id: string): void {
    const resume = this.currentResumes.find(r => r.id === id);
    if (!resume) {
      this.showToast('Resume not found', 'error');
      return;
    }

    this.showLoading(true, 'download');
    window.open(`${this.API_BASE}/${id}/download`, '_blank');
    setTimeout(() => this.showLoading(false, 'download'), 1000);
  }

  confirmDeleteResume(id: string): void {
    const resume = this.currentResumes.find(r => r.id === id);
    if (!resume) return;

    Swal.fire({
      title: 'Delete Resume?',
      html: `Are you sure you want to delete <b>${resume.name}'s</b> resume?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteResume(id);
      }
    });
  }

 async deleteResume(id: string): Promise<void> {
  try {
    debugger;
    this.showLoading(true, 'delete');

    const response = await fetch(`${this.API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete');
    }

    this.showToast('Resume deleted successfully', 'success');
    this.loadResumes();
    // this.loadStats();
  } catch (error) {
    this.showToast('Failed to delete resume', 'error');
  } finally {
    this.showLoading(false, 'delete');
  }
}

  showEmailDialog(resumeId: string,userEmail:String): void {
  Swal.fire({
    title: 'Send Profile via Email',
    html: `
      <div class="mb-3">
        <label class="form-label">Recipient Email <span class="text-danger">*</span></label>
        <input id="recipientEmail" class="form-control" type="email" placeholder="example@domain.com" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Subject <span class="text-danger">*</span></label>
        <input id="emailSubject" class="form-control" type="text" placeholder="Email Subject" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Custom Message (optional)</label>
        <textarea id="customMessage" class="form-control" rows="3"></textarea>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Send Email',
    preConfirm: () => {
      const popup = Swal.getPopup();
      if (!popup) return false;

      const getValue = (selector: string): string => {
        const el = popup.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
        return el?.value || '';
      };

      const email = getValue('#recipientEmail');
      const subject = getValue('#emailSubject');
      const message = getValue('#customMessage');

      if (!email) {
        Swal.showValidationMessage('Please enter recipient email');
        return false;
      }

      return { email, subject, message };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      this.sendProfileEmail(resumeId, result.value.email, result.value.subject, result.value.message,userEmail);
    }
  });
}

  async sendProfileEmail(resumeId: string, recipientEmail: string, subject: string, message: string,userEmail: String): Promise<void> {
  try {
    const response = await fetch(`${this.API_BASE}/${resumeId}/send-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userEmail: userEmail,
        recipientEmail,
        subject: subject || '',
        customMessage: message || ''
      }),
      credentials: 'include'
    });

    // Safely parse JSON if available
    const text = await response.text();
    let result: any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.warn('Non-JSON response:', text);
    }

    if (response.ok) {
      this.showToast('Email sent successfully!', 'success');
    } else {
      const errorMsg = result?.error || 'Failed to send email.';
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error('Email sending failed:', error);
    this.showToast(`Failed to send email: ${error.message}`, 'error');
  }
}

  showLoading(show: boolean, context: string = ''): void {
    // Implement loading indicators based on context
    // You'll need to bind these to your template
  }

  showToast(message: string, type: string = 'info'): void {
    const bgColor = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
    }[type] || '#6c757d';

    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: bgColor,
      stopOnFocus: true,
    }).showToast();
  }
}