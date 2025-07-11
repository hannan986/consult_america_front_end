import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { F } from '@angular/cdk/keycodes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'],
   standalone: true,
  imports: [
    
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    
  ],
})
export class ResetPassword implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  successMessage = '';
  errorMessage = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onReset(): void {
      const payload = {
      token: this.token,
      newPassword: this.newPassword
    };
 this.http.post('http://localhost:8080/api/auth/reset-password', payload)
      .subscribe({
        next: () => alert('Password reset successful!'),
        error: err => {
          console.error('Reset failed:', err);
          alert(err.error || 'Something went wrong.');
        }
      });
  }
}
