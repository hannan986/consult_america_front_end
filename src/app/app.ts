import { MatTabsModule } from '@angular/material/tabs';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StatePersistenceService } from './services/state-persistence.service';
import { RouterOutlet } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';  // Keep this import
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card'; // ✅ Add this
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationComponent } from './auth/registration/registration.component';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApplicantsComponent } from './applicants/applicants.component';
import { ApplicantFormDialogComponent } from './applicants/applicant-form-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSnackBarModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    
    
  ApplicantsComponent,
  ApplicantFormDialogComponent,
  MatTabsModule,
  // Angular Material table cell/row directives for standalone usage
  // (these are re-exported by MatTableModule, but explicit import can help with template errors)
  // No explicit import needed for matHeaderCellDef, matCellDef, matHeaderRowDef, matRowDef if MatTableModule is present
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'consult_america_hr_front_end';

  constructor(
    private router: Router,
    private statePersistence: StatePersistenceService
  ) {}

  ngOnInit() {
    const savedRoute = this.statePersistence.getRoute();
    if (savedRoute && savedRoute !== this.router.url) {
      this.router.navigateByUrl(savedRoute);
    }
    this.router.events.subscribe(event => {
      // Only save route on navigation end
      if ((event as any).url) {
        this.statePersistence.saveRoute((event as any).url);
      }
    });
  }
}
