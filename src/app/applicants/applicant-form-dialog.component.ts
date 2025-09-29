import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup,FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Applicant } from '../models/applicant';

// Angular Material imports
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-applicant-form-dialog',
  standalone: true,
  templateUrl: './applicant-form-dialog.component.html',
  styleUrls: ['./applicant-form-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ApplicantFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApplicantFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Applicant> | null
  ) {
    this.form = this.fb.group({
      firstName: [data?.firstName || '', Validators.required],
      middleName: [data?.middleName || ''],
      lastName: [data?.lastName || '', Validators.required],
      visaStatus: [data?.visaStatus || '', Validators.required],
      documents: this.fb.array((data?.documents || []).map(doc => this.fb.control(doc)))
    });
  }

  get documents() {
    return this.form.get('documents') as FormArray;
  }

  addDocument() {
    this.documents.push(this.fb.control(''));
  }

  removeDocument(index: number) {
    this.documents.removeAt(index);
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
