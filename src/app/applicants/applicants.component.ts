import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicantService } from '../services/applicant.service';
import { Applicant } from '../models/applicant';
import { ApplicantFormDialogComponent } from './applicant-form-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-applicants',
  templateUrl: './applicants.component.html',
  styleUrls: ['./applicants.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatTableModule, MatProgressSpinnerModule, MatIconModule]
})
export class ApplicantsComponent implements OnInit {
  exportToExcel(): void {
    if (!this.applicants || this.applicants.length === 0) return;
    const data = this.applicants.map((a: Applicant) => ({
      ID: a.id,
      'First Name': a.firstName,
      'Middle Name': a.middleName || '',
      'Last Name': a.lastName,
      'Visa Status': a.visaStatus,
      Documents: (a.documents || []).join(', ')
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    // Style header row
    const header = Object.keys(data[0] || {});
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: '1976D2' }, sz: 13 },
          fill: { fgColor: { rgb: 'E3F2FD' } },
          alignment: { horizontal: 'center' }
        };
      }
    }
    ws['!cols'] = header.map(() => ({ wch: 18 }));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applicants');
    XLSX.writeFile(wb, 'consult_america_applicants.xlsx');
  }
  applicants: Applicant[] = [];
  loading = false;

  // For Excel-like add
  newApplicantForm: FormGroup;
  addingNew = false;
  newApplicantColumns = ['firstName', 'middleName', 'lastName', 'visaStatus', 'documents', 'actions'];
  displayedColumns = ['id', 'firstName', 'middleName', 'lastName', 'visaStatus', 'documents', 'actions'];

  constructor(
    private applicantService: ApplicantService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.newApplicantForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      visaStatus: ['', Validators.required],
      documents: [''] // comma separated string
    });
  }

  ngOnInit() {
    this.loadApplicants();
  }

  loadApplicants() {
    this.loading = true;
    this.applicantService.getApplicants().subscribe({
      next: (data) => {
        this.applicants = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load applicants', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  startAdd() {
    this.addingNew = true;
    this.newApplicantForm.reset();
  }

  cancelAdd() {
    this.addingNew = false;
    this.newApplicantForm.reset();
  }

  saveNewApplicant() {
    if (this.newApplicantForm.invalid) return;
    const formValue = this.newApplicantForm.value;
    const newApplicant: Omit<Applicant, 'id'> = {
      firstName: formValue.firstName,
      middleName: formValue.middleName,
      lastName: formValue.lastName,
      visaStatus: formValue.visaStatus,
      documents: formValue.documents ? formValue.documents.split(',').map((d: string) => d.trim()).filter((d: string) => d) : []
    };
    this.applicantService.createApplicant(newApplicant).subscribe({
      next: () => {
        this.snackBar.open('Applicant created', 'Close', { duration: 2000 });
        this.loadApplicants();
        this.cancelAdd();
      },
      error: () => this.snackBar.open('Failed to create applicant', 'Close', { duration: 3000 })
    });
  }

  editApplicant(applicant: Applicant) {
    const dialogRef = this.dialog.open(ApplicantFormDialogComponent, {
      width: '400px',
      data: { ...applicant }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.applicantService.updateApplicant(applicant.id, result).subscribe({
          next: () => {
            this.snackBar.open('Applicant updated', 'Close', { duration: 2000 });
            this.loadApplicants();
          },
          error: () => this.snackBar.open('Failed to update applicant', 'Close', { duration: 3000 })
        });
      }
    });
  }

  deleteApplicant(applicant: Applicant) {
    if (confirm(`Delete applicant ${applicant.firstName} ${applicant.lastName}?`)) {
      this.applicantService.deleteApplicant(applicant.id).subscribe({
        next: () => {
          this.snackBar.open('Applicant deleted', 'Close', { duration: 2000 });
          this.loadApplicants();
        },
        error: () => this.snackBar.open('Failed to delete applicant', 'Close', { duration: 3000 })
      });
    }
  }
}
