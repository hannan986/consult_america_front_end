import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select'; // ✅ Add this

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
})
export class RegistrationComponent {
  registerForm: FormGroup;
  emailExists = false;
  checkingEmail = false;
  submitted = false;
  error = '';
  hide = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CANDIDATE', Validators.required]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

onSubmit(): void {
  this.submitted = true;
  this.error = '';

  if (this.registerForm.invalid) {
    return;
  }

  const formValue = this.registerForm.value;

  const userPayload = {
    name: formValue.name,
    email: formValue.email,
    password: formValue.password,
    role: { name: formValue.role }  // Sends { name: "CANDIDATE" }
  };

  this.authService.register(userPayload).subscribe({
    next: () => this.router.navigate(['/dashboard']),
    error: (error) => {
      this.error = error.error?.message || 'Registration failed';
    }
  });
}

  singIn(): void {
    //this.authService.logout();
    this.router.navigate(['/login']);
  }

}