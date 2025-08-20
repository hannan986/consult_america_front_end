// =======================
// candidate-details.component.ts
// =======================
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from '../services/candidate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment.prod';
@Component({
  selector: 'app-candidate-detail',
  templateUrl: './candidate-details.html',
  styleUrls: ['./candidate-details.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CandidateDetails implements OnInit {
  candidate: any;
  resumes: any[] = [];
  documents: any[] = [];
  selectedFile: File | null = null;
  selectedDocumentType: string | null = null;
  showSendDialog = false;
  sendInfo = true;
  sendResumes = false;
  sendDocs = false;
  isSending = false;
  isUploading = false;
  isDeleting = false;

  constructor(
    private route: ActivatedRoute,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {
    const paramId = Number(this.route.snapshot.paramMap.get('id'));
    const id = paramId || Number(localStorage.getItem('userId'));
    this.candidateService.getCandidate(id).subscribe({
      next: (res) => {
        this.candidate = res.body;
        if (this.candidate?.email) {
          this.loadResumesByEmail(this.candidate.email);
        }
        if (this.candidate?.id) {
          this.loadDocumentsByUserId(this.candidate.id);
        }
      },
      error: (err) => console.error('Error loading candidate:', err)
    });
  }

  loadResumesByEmail(email: string): void {
    
    this.candidateService.getResumesByEmail(email).subscribe({
      next: (data) => {
        this.resumes = data.map(resume => ({
          ...resume,
          downloadUrl: `${environment.apiBaseUrl}/api/resumes/${resume.id}/download`
        }));
      },
      error: (err) => console.error('Error loading resumes:', err)
    });
  }

  loadDocumentsByUserId(userId: number): void {
    this.candidateService.getDocumentsByUserId(userId).subscribe({
      next: (data: any[]) => {
        this.documents = data.map(doc => ({
          ...doc,
          downloadUrl: `${environment.apiBaseUrl}/api/documents/${doc.id}/download`
        }));
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        this.documents = [];
      }
    });
  }

  openSendDialog(): void {
    this.sendInfo = true;
    this.sendResumes = false;
    this.sendDocs = false;
    this.showSendDialog = true;
  }

  closeSendDialog(): void {
    this.showSendDialog = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file || null;
  }

  async uploadDocument(): Promise<void> {
    if (!this.selectedFile || !this.selectedDocumentType || !this.candidate?.id) return;
    this.isUploading = true;
    try {
      await this.candidateService.uploadDocument(this.candidate.id, this.selectedFile, this.selectedDocumentType);
      this.loadDocumentsByUserId(this.candidate.id);
      this.selectedFile = null;
      this.selectedDocumentType = null;
    } catch (err) {
      console.error('Upload error:', err);
      alert('Document upload failed.');
    } finally {
      this.isUploading = false;
    }
  }

  deleteDocument(documentId: number): void {
    if (!confirm('Are you sure you want to delete this document?')) return;
    this.isDeleting = true;
    this.candidateService.deleteDocument(documentId).subscribe({
      next: () => {
        this.documents = this.documents.filter(doc => doc.id !== documentId);
      },
      error: err => {
        console.error('Delete error:', err);
        alert('Failed to delete document.');
      },
      complete: () => {
        this.isDeleting = false;
      }
    });
  }

  async sendSelected(): Promise<void> {
    if (!this.candidate?.email) {
      alert('No candidate email available');
      return;
    }

    const payload: any = {};
    if (this.sendInfo) {
      payload.info = {
        firstName: this.candidate.firstName,
        lastName: this.candidate.lastName,
        email: this.candidate.email,
        primaryPhone: this.candidate.primaryPhone,
        primaryAddress: this.candidate.primaryAddress,
        secondaryPhone: this.candidate.secondaryPhone,
        secondaryAddress: this.candidate.secondaryAddress,
        yearsOfExperience: this.candidate.yearsOfExperience,
        clientNames: [this.candidate.clientName1, this.candidate.clientName2, this.candidate.clientName3].filter(Boolean),
        techStack: this.candidate.techStack,
        visaStatus: this.candidate.visaStatus,
        workAuthorization: this.candidate.workAuthorization,
        location: this.candidate.location,
        employmentType: this.candidate.employmentType
      };
    }

    if (this.sendResumes && this.resumes.length) {
      payload.resumes = this.resumes.map(r => ({
        fileName: r.fileName,
        url: r.downloadUrl,
        uploadedAt: r.uploadedAt
      }));
    }

    if (this.sendDocs && this.documents.length) {
      payload.documents = this.documents.map(d => ({
        fileName: d.fileName,
        url: d.downloadUrl,
        uploadedAt: d.uploadedAt,
        type: d.documentType
      }));
    }

    if (!payload.info && !payload.resumes && !payload.documents) {
      alert('Select at least one item to send');
      return;
    }

    this.isSending = true;
    try {
      await this.candidateService.sendCandidateEmail(this.candidate.id, payload);
      alert('Email sent successfully.');
      this.closeSendDialog();
    } catch (err) {
      console.error('Email send error:', err);
      alert('Failed to send email.');
    } finally {
      this.isSending = false;
    }
  }
}
