import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from '../services/candidate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-candidate-detail',
  templateUrl: './candidate-details.html',
  styleUrls: ['./candidate-details.scss'],
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class CandidateDetails implements OnInit {

  candidate: any;
  resumes: any[] = [];
  documents: any[] = [];
  selectedFile: File | null = null;
 id: String | null = null;
  // New: selected document type from dropdown/input
  selectedDocumentType: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private candidateService: CandidateService
  ) {}

  ngOnInit(): void {

    
    // var id = Number(this.route.snapshot.paramMap.get('id'));

    // const storedId = Number(localStorage.getItem('userId'));
debugger;
    if(!Number(this.route.snapshot.paramMap.get('id'))){
      var id = Number(localStorage.getItem('userId'));
    }else {
      var id = Number(this.route.snapshot.paramMap.get('id'));
    }
    this.candidateService.getCandidate(id).subscribe({
      next: (res) => {
        this.candidate = res.body;

        if (this.candidate?.email) {
          this.candidateService.getResumesByEmail(this.candidate.email).subscribe({
            next: (resumes) => this.resumes = resumes,
            error: err => console.error('Error loading resumes:', err)
          });
        }

        if (this.candidate?.id) {
          this.loadDocumentsByUserId(this.candidate.id);
        }
      },
      error: err => console.error('Error loading candidate:', err)
    });
  }

  loadResumesByEmail(email: string): void {
    this.candidateService.getResumesByEmail(email).subscribe({
      next: data => {
        console.log('Resumes loaded:', data);
        this.resumes = data;
      },
      error: err => console.error('Error loading resumes:', err)
    });
  }

  loadDocumentsByUserId(userId: number): void {
    if (!userId) {
      console.warn('Invalid userId in loadDocumentsByUserId:', userId);
      this.documents = [];
      return;
    }

    this.candidateService.getDocumentsByUserId(userId).subscribe({
      next: (data: any[]) => {
        if (!data || data.length === 0) {
          console.log('No documents found for userId:', userId);
          this.documents = [];
          return;
        }

        this.documents = data.map(doc => ({
          ...doc,
          downloadUrl: `http://localhost:8080/api/documents/${doc.id}/download`
        }));

        console.log('Documents loaded:', this.documents);
      },
      error: err => {
        console.error('Error loading documents for userId:', userId, err);
        this.documents = [];
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }
 uploadDocument(): void {
    if (!this.selectedFile) {
      console.warn('No file selected.');
      return;
    }

    if (!this.candidate?.id) {
      console.warn('Candidate ID is missing.');
      return;
    }

    if (!this.selectedDocumentType) {
      console.warn('Document type is not selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('documentType', this.selectedDocumentType);

   
   
 this.candidateService.uploadDocument(
  this.candidate.id,
  this.selectedFile!,
  this.selectedDocumentType!
).subscribe({
  next: () => {
    this.loadDocumentsByUserId(this.candidate.id);
    this.selectedFile = null;
    this.selectedDocumentType = null;
  },
  error: err => console.error('Upload failed:', err)
});
  }

  deleteDocument(documentId: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.candidateService.deleteDocument(documentId).subscribe(() => {
        this.documents = this.documents.filter(doc => doc.id !== documentId);
      });
    }
  }
}
