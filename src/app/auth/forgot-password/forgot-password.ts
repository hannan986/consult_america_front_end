import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
   imports: [FormsModule,CommonModule ], // ✅ fixed property name
})
export class ForgotPassword {
  email = '';
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {

 
    const url = `${environment.apiBaseUrl}/api/auth/forgot-password`;
    this.http.post('${environment.apiBaseUrl}/api/auth/forgot-password', { email: this.email })
      .subscribe({
        next: () => {
          this.successMessage = 'Password reset link sent to your email.';
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to send reset email.';
          this.successMessage = '';
        }
      });
  }
}
