import { Component } from '@angular/core';
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
export class App {
  protected title = 'consult_america_hr_front_end';
}
