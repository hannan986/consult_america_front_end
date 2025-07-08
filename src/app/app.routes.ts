import { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { Employees } from './employees/employees';
import { Settings } from './settings/settings';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './services/auth.guard';
import { CandidateList } from './candidate-list/candidate-list';
import { CandidateDetails } from './candidate-details/candidate-details';
import { RegistrationComponent } from './auth/registration/registration.component';
import { ResumeUpload } from './resume-upload/resume-upload';
import { UserProfile } from './user-profile/user-profile';
import { JobPost } from './job-post/job-post';
import { JobList } from './job-list/job-list';
import { DocumentUploadComponent } from './document-upload.component/document-upload.component';
import { JobDetail } from './job-detail/job-detail';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';

export const routes: Routes = [
  // Public routes (no layout, no auth guard)
  { path: 'login', component: LoginComponent },
 
  { path: 'forgot-password', component: ForgotPassword },
   { path: 'reset-password', component: ResetPassword },
  // Protected routes (with layout and auth guard)
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'employees', component: Employees },
      { path: 'settings', component: Settings },
      { path: 'candidate', component: CandidateList },
      { path: 'candidates/:id', component: CandidateDetails },
      { path: 'candidates', component: CandidateDetails },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'uploadResume', component: ResumeUpload },
      { path: 'update_profile', component: UserProfile },
      { path: 'post-job', component: JobPost},
      { path: 'job-list', component: JobList },
      { path: 'document-upload', component: DocumentUploadComponent },
      { path: 'job-details/:id', component: JobDetail },
      { path: 'job-details/:id', component: JobDetail },
       { path: 'registeration', component: RegistrationComponent },
      
    ]
  },
  
  // Wildcard route (should be last)
  { path: '**', redirectTo: 'login' }
];