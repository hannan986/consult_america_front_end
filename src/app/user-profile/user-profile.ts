import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../services/userProfile.service';
import { AuthService } from '../services/auth.service';
import { UserProfileModel } from '../models/userProfileModel';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class UserProfile implements OnInit {
  profileForm!: FormGroup;
  userProfile!: UserProfileModel;
  userEmail: string | null = null;
  loading = false;
  successMessage = '';
  error: any;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail');
    if (!this.userEmail) {
      console.error('No user email found in localStorage');
    } else {
      this.loading = true;
      this.loadUserProfile();
    }
  }

  loadUserProfile(): void {
    this.userProfileService.getUserProfile(this.userEmail!).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.initForm(profile);
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  initForm(profile: UserProfileModel): void {
    this.profileForm = this.fb.group({
      id: [profile.id],
      email: [{ value: profile.email, disabled: true }, [Validators.required, Validators.email]],
      name: [profile.name, Validators.required],
      firstName: [profile.firstName],
      lastName: [profile.lastName],
      visaStatus: [profile.visaStatus],
      workAuthorization: [profile.workAuthorization],
      clientName1: [profile.clientName1],
      clientName2: [profile.clientName2],
      clientName3: [profile.clientName3],
      primaryAddress: [profile.primaryAddress],
      primaryPhone: [profile.primaryPhone],
      secondaryAddress: [profile.secondaryAddress],
      secondaryPhone: [profile.secondaryPhone],
      techStack: [profile.techStack],
      yearsOfExperience: [profile.yearsOfExperience],
      location: [profile.location],
      employmentType: [profile.employmentType]
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updatedProfile: UserProfileModel = {
      ...this.profileForm.getRawValue()
    };

    this.userProfileService.updateUserProfile(updatedProfile).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        alert(this.successMessage);
      },
      error: (err) => {
        this.error = err;
        alert('Failed to update profile.');
        console.error(err);
      }
    });
  }
}
