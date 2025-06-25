import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, MatIconModule, MatButtonModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {
  sidebarOpen = true;
  dropdownOpen = false;
userRole: string | null = null;
  constructor(public authService: AuthService, private router: Router) {}
ngOnInit() {
  this.userRole = localStorage.getItem('userRole');
}


//   get userRole(): string | null {
//     console.log('user role = ',localStorage.getItem('userRole'))
//   return localStorage.getItem('userRole');
// }
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.dropdownOpen = false; // Close dropdown when toggling sidebar
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/logout']);
  }
}