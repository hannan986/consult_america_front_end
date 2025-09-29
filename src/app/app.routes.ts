import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import your components
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
import { JdAnalyzer } from './jd-analyzer/jd-analyzer';
import { JobList } from './job-list/job-list';
import { DocumentUploadComponent } from './document-upload.component/document-upload.component';
import { JobDetail } from './job-detail/job-detail';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';
import { SentEmailService } from './services/sent-email';
import { SentEmailsComponent } from './sent-emails/sent-emails';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  
  // Protected routes with layout
  {
    path: '',
    component: Layout,
    // canActivate: [AuthGuard], // Uncomment when auth is ready
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'employees', component: Employees },
      { path: 'settings', component: Settings },
      { path: 'candidate', component: CandidateList },
      { 
  path: 'candidates/:id', 
  component: CandidateDetails,
  data: { renderMode: 'no-prerender' } // ✅ disables prerender for dynamic route
},
       { path: 'candidates', component: CandidateDetails },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'uploadResume', component: ResumeUpload },
      { path: 'update_profile', component: UserProfile },
      { path: 'post-job', component: JobPost },
  { path: 'jd-analyzer', component: JdAnalyzer },
      { path: 'job-list', component: JobList },
  { path: 'document-upload', component: DocumentUploadComponent },
  { path: 'applied-jobs', component: SentEmailsComponent },
  { path: 'applicants', loadComponent: () => import('./applicants/applicants.component').then(m => m.ApplicantsComponent) },
      
      { 
  path: 'job-details/:id', 
  component: JobDetail,
  data: { renderMode: 'no-prerender' } // ✅ disables prerender for dynamic route
},
    
       { path: 'registeration', component: RegistrationComponent },
      
    ]
  },

  // Wildcard route
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })], // HTML5 routing
  exports: [RouterModule]
})
export class AppRoutingModule {}
