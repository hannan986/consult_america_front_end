import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
 
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

get f() { 
  return this.loginForm.controls as { [key: string]: AbstractControl }; 
}

  onSubmit() {
    console.log("on Submit")
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    console.log("WORKING")
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error) => console.error('Login failed:', error)
    });
  }

   singup(): void {
    //this.authService.logout();
    this.router.navigate(['/registeration']);
  }

  forgotPassword(): void {
  this.router.navigate(['/forgot-password']);
  }

  testNavigation() {
  console.log('Attempting navigation');
  this.router.navigate(['/forgot-password'])
    .then(success => {
      console.log('Navigation success:', success);
    })
    .catch(err => {
      console.error('Navigation failed:', err);
    });
}
}

