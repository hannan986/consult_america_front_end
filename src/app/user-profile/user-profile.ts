import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule ,FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CandidateService } from '../services/candidate';
import { UserProfileModel } from '../models/userProfileModel';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../services/userProfile.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ], // fixed `styleUrl` to `styleUrls`
})

export class UserProfile implements OnInit {
  profileForm!: FormGroup;
  userProfile!: UserProfileModel;
  userId = 1; // replace this with actual user ID
  loading = false;
  successMessage = '';
  error: any;
userEmail: string | null = null;
constructor(private authService: AuthService, private fb: FormBuilder, private userProfileService: UserProfileService) {}

  
  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail'); // get email from auth service
    if (!this.userEmail) {
    console.error('No user email found in localStorage');
    // Optionally, redirect to login page or show an error
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
      clientName1: [profile.clientName1],
      clientName2: [profile.clientName2],
      clientName3: [profile.clientName3],
      firstName: [profile.firstName],
      lastName: [profile.lastName],
      primaryAddress: [profile.primaryAddress],
      primaryPhone: [profile.primaryPhone],
      secondaryAddress: [profile.secondaryAddress],
      secondaryPhone: [profile.secondaryPhone],
      techStack: [profile.techStack],
      yearsOfExperience: [profile.yearsOfExperience]
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
