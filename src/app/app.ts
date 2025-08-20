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
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,MatSnackBarModule,  HttpClientModule,ReactiveFormsModule, MatCardModule,         // ✅ Add this
    MatFormFieldModule,    // Make sure this is added too
    MatInputModule,
    MatButtonModule,
    MatIconModule,ReactiveFormsModule   ],
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
